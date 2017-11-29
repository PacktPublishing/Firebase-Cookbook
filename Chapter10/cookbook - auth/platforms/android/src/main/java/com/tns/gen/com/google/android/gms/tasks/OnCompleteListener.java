package com.tns.gen.com.google.android.gms.tasks;

public class OnCompleteListener implements com.google.android.gms.tasks.OnCompleteListener {
	public OnCompleteListener() {
		com.tns.Runtime.initInstance(this);
	}

	public void onComplete(com.google.android.gms.tasks.Task param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onComplete", void.class, args);
	}

}
