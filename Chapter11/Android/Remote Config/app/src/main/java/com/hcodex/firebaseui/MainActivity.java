package com.hcodex.firebaseui;

import android.content.Intent;
import android.support.annotation.NonNull;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.firebase.ui.auth.AuthUI;
import com.google.android.gms.auth.api.Auth;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.remoteconfig.FirebaseRemoteConfig;
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Objects;

public class MainActivity extends AppCompatActivity implements View.OnClickListener{
    private static final int RC_SIGN_IN = 17;
    Boolean doISupportFacebookAuth;
    private FirebaseRemoteConfig rConfig = FirebaseRemoteConfig.getInstance();
    FirebaseAuth auth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        auth = FirebaseAuth.getInstance();
        rConfig.setConfigSettings(new FirebaseRemoteConfigSettings.Builder()
            .setDeveloperModeEnabled(true)
            .build());
        HashMap<String, Object> defaultValues = new HashMap<>();
        defaultValues.put("doISupportFacebookAuth", true);
        rConfig.setDefaults(defaultValues);
        final Task<Void> fetch = rConfig.fetch(0); //Cache experation time, 0 value = Keep on fetching.
        fetch.addOnSuccessListener(this, new OnSuccessListener<Void>() {
            @Override
            public void onSuccess(Void aVoid) {
                rConfig.activateFetched();
            }
        });

        if(auth.getCurrentUser() != null) {
            Log.d("Auth", "Logged in successfully");
        } else {
            doISupportFacebookAuth = rConfig.getBoolean("doISupportFacebookAuth");
            Log.d("doISupportFacebookAuth", doISupportFacebookAuth.toString());

            if(doISupportFacebookAuth) {
                startActivityForResult(
                        AuthUI.getInstance()
                                .createSignInIntentBuilder()
                                .setAvailableProviders(
                                        Arrays.asList(new AuthUI.IdpConfig.Builder(AuthUI.EMAIL_PROVIDER).build(),
                                                new AuthUI.IdpConfig.Builder(AuthUI.GOOGLE_PROVIDER).build(),
                                                new AuthUI.IdpConfig.Builder(AuthUI.FACEBOOK_PROVIDER).build()))
                                .build(),
                        RC_SIGN_IN);
            } else {
                startActivityForResult(
                        AuthUI.getInstance()
                                .createSignInIntentBuilder()
                                .setAvailableProviders(
                                        Arrays.asList(new AuthUI.IdpConfig.Builder(AuthUI.EMAIL_PROVIDER).build()))
                                .build(),
                        RC_SIGN_IN);
            }
        }
        findViewById(R.id.logoutBtn).setOnClickListener(this);

    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == RC_SIGN_IN) {
            if(resultCode == RESULT_OK) {
                //User is in !
                Log.d("Auth", auth.getCurrentUser().getEmail());
            } else {
                //User is not authenticated
                Log.d("Auth", "Not Authenticated");
            }
        }

    }

    @Override
    public void onClick(View v) {
        if(v.getId() == R.id.logoutBtn) {
            AuthUI.getInstance().signOut(this).addOnCompleteListener(new OnCompleteListener<Void>() {
                @Override
                public void onComplete(@NonNull Task<Void> task) {
                    Log.d("Auth", "Logged out successfully");
                    finish();
                }
            });
        }
    }
}
