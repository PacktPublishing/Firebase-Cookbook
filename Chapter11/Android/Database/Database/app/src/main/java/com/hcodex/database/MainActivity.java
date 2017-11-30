package com.hcodex.database;

import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ListView;

import com.google.firebase.database.ChildEventListener;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.util.ArrayList;

public class MainActivity extends AppCompatActivity {
    EditText wishListText;
    Button addToWishList;
    ListView wishListview;
    ArrayList<String> wishes = new ArrayList<String>();
    ArrayAdapter<String> adapter;

    // [*] Getting a reference to the Database Root.
    DatabaseReference fRootRef = FirebaseDatabase.getInstance().getReference();

    //[*] Getting a reference to the wishes list.
    DatabaseReference wishesRef = fRootRef.child("wishes");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        //[*] UI elements
        wishListText = (EditText) findViewById(R.id.wishListText);
        addToWishList = (Button) findViewById(R.id.addWishBtn);
        wishListview = (ListView) findViewById(R.id.wishsList);

        adapter = new ArrayAdapter<String>(this, R.layout.support_simple_spinner_dropdown_item, wishes);
        wishListview.setAdapter(adapter);
    }

    @Override
    protected void onStart() {
        super.onStart();
        wishesRef.addChildEventListener(new ChildEventListener() {
            @Override
            public void onChildAdded(DataSnapshot dataSnapshot, String s) {
                String newWish = dataSnapshot.getValue(String.class);
                Log.d("firebase thing", newWish);
                wishes.add(newWish);
                adapter.notifyDataSetChanged();
            }

            @Override
            public void onChildChanged(DataSnapshot dataSnapshot, String s) {

            }

            @Override
            public void onChildRemoved(DataSnapshot dataSnapshot) {

            }

            @Override
            public void onChildMoved(DataSnapshot dataSnapshot, String s) {

            }

            @Override
            public void onCancelled(DatabaseError databaseError) {

            }
        });
        addToWishList.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String wish = wishListText.getText().toString();
                wishesRef.push().setValue(wish);
                AlertDialog alertDialog = new AlertDialog.Builder(MainActivity.this).create();
                alertDialog.setTitle("Success");
                alertDialog.setMessage("wish was added to Firebase");
                alertDialog.show();
            }
        });
    }
}
