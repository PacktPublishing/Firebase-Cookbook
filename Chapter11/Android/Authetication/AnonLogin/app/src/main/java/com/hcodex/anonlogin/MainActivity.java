package com.hcodex.anonlogin;

import android.support.annotation.NonNull;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.AuthResult;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;

public class MainActivity extends AppCompatActivity {
    FirebaseAuth anonAuth;
    TextView profileData;
    //FirebaseAuth.AuthStateListener authStateListener;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        anonAuth = FirebaseAuth.getInstance();
        setContentView(R.layout.activity_main);
    }

    private void updateUI(FirebaseUser user) {
        profileData = (TextView) findViewById(R.id.profileData);
        profileData.append("Anonymous Profile Id : \n" + user.getUid());
    }

    //[*] Listening on the Login button click event.
    public void anonLoginBtn(View view)  {
        anonAuth.signInAnonymously().addOnCompleteListener(this, new OnCompleteListener<AuthResult>() {
            @Override
            public void onComplete(@NonNull Task<AuthResult> task) {
                if(!task.isSuccessful()) {
                    updateUI(null);
                } else {
                    FirebaseUser fUser = anonAuth.getCurrentUser();
                    Log.d("FIRE", fUser.getUid());
                    updateUI(fUser);
                }
            }
        });
    }
}
