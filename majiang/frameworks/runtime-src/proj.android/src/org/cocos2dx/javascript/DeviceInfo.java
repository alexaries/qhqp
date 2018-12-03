package org.cocos2dx.javascript;

import org.json.JSONException;
import org.json.JSONObject;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.net.wifi.WifiInfo;
import android.net.wifi.WifiManager;
import android.os.Build;
import android.telephony.TelephonyManager;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

public class DeviceInfo extends BroadcastReceiver {	
	private static DeviceInfo instance;
	public int m_Level = 0;	//! 电量
	private boolean m_Init = false; //! 是否获取过 

	public static DeviceInfo getInstance() {
		if (instance == null) {
			instance = new DeviceInfo();
			instance.m_Init = false;
		}
		return instance;
	}
	
	//! 得到电量
	public int getLevel() {
		m_Init = true;
		return m_Level;
	}

	@Override
	public void onReceive(Context arg0, Intent intent) {
		// TODO Auto-generated method stub
		String action = intent.getAction();
		if (Intent.ACTION_BATTERY_CHANGED.equals(action)) {
			int cur = intent.getIntExtra("level", 0);
			int total = intent.getIntExtra("scale", 100);
			DeviceInfo.getInstance().m_Level = cur * 100 / total;
			if(m_Init) {
				AppActivity.g_this.runOnGLThread(new Runnable() {
					@Override
					public void run() {
						String rStr = "gameclass.mod_platform.getBattery(\"" + DeviceInfo.getInstance().m_Level + "\")";
						Cocos2dxJavascriptJavaBridge.evalString(rStr);
					}
				});		
			}
		}
	}
}
