package com.tns.gen.java.lang;

public class Object_frnal_ts_helpers_l58_c38__TransitionListenerImpl extends java.lang.Object implements com.tns.NativeScriptHashCodeProvider, android.transition.Transition.TransitionListener {
	public Object_frnal_ts_helpers_l58_c38__TransitionListenerImpl(){
		super();
		com.tns.Runtime.initInstance(this);
	}

	public void onTransitionStart(android.transition.Transition param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onTransitionStart", void.class, args);
	}

	public void onTransitionEnd(android.transition.Transition param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onTransitionEnd", void.class, args);
	}

	public void onTransitionResume(android.transition.Transition param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onTransitionResume", void.class, args);
	}

	public void onTransitionPause(android.transition.Transition param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onTransitionPause", void.class, args);
	}

	public void onTransitionCancel(android.transition.Transition param_0)  {
		java.lang.Object[] args = new java.lang.Object[1];
		args[0] = param_0;
		com.tns.Runtime.callJSMethod(this, "onTransitionCancel", void.class, args);
	}

	public boolean equals__super(java.lang.Object other) {
		return super.equals(other);
	}

	public int hashCode__super() {
		return super.hashCode();
	}

}
