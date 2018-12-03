package org.cocos2dx.javascript;

import java.util.List;
import android.util.Log;
import java.text.SimpleDateFormat;
import java.util.Locale;

import org.json.JSONException;
import org.json.JSONObject;

import com.amap.api.location.AMapLocation;
import com.amap.api.location.AMapLocationClient;
import com.amap.api.location.AMapLocationClientOption;
import com.amap.api.location.AMapLocationClientOption.AMapLocationMode;
import com.amap.api.location.AMapLocationClientOption.AMapLocationProtocol;
import com.amap.api.location.AMapLocationListener;
import android.os.Bundle;
import android.content.Context; 
import android.app.AlertDialog;  
import android.content.DialogInterface;  
public class MapLocation {
	public static MapLocation g_seltInstance = null;
	public String mapinfo = "";
	private AMapLocationClient locationClient = null; 
	
	public static MapLocation getInstance( Context context){
		if(g_seltInstance == null){
			g_seltInstance = new MapLocation(context);
		}
		return g_seltInstance;
	}
	
	public static MapLocation getInstance() {
		return g_seltInstance;
	}
	
	public MapLocation(Context context) {
		Log.d("aaaaaaaa", "1111111");
		this.initLocation(context);
		Log.d("aaaaaaaa", "2222222");
		locationClient.startLocation();
	}
	
	private void initLocation(Context context){
		locationClient = new AMapLocationClient(context);
		locationClient.setLocationOption(this.getDefaultOption());
		locationClient.setLocationListener(locationListener);
	}
	
	private AMapLocationClientOption getDefaultOption() {
		AMapLocationClientOption mOption = new AMapLocationClientOption();
		//! 可选，设置定位模式，可选的模式有高精度、仅设备、仅网络。默认为高精度模式
		mOption.setLocationMode(AMapLocationMode.Hight_Accuracy);
		//! 可选，设置是否gps优先，只在高精度模式下有效。默认关闭
		mOption.setGpsFirst(false);
		//! 可选，设置网络请求超时时间。默认为30秒。在仅设备模式下无效
		mOption.setHttpTimeOut(30000);
		//! 可选，设置定位间隔。默认为2秒
		mOption.setInterval(2000);
		//! 可选，设置定位间隔。默认为2秒
		mOption.setNeedAddress(true);
		//! 可选，设置是否单次定位。默认是false
		mOption.setOnceLocation(true);
		//! 可选，设置是否等待wifi刷新，默认为false.如果设置为true,会自动变为单次定位，持续定位时不要使用
		mOption.setOnceLocationLatest(false);
		//! 设置网络请求的协议。可选HTTP或者HTTPS。默认为HTTP
		AMapLocationClientOption.setLocationProtocol(AMapLocationProtocol.HTTP);
		//! 可选，设置是否使用传感器。默认是false
		mOption.setSensorEnable(false);
		//! 可选，设置是否开启wifi扫描。默认为true，如果设置为false会同时停止主动刷新，停止以后完全依赖于系统刷新，定位位置可能存在误差
		mOption.setWifiScan(true);
		//! 可选，设置是否使用缓存定位，默认为true
		mOption.setLocationCacheEnable(true);
		return mOption;
	}	
	
	public AMapLocationListener locationListener = new AMapLocationListener() {
		@Override
		public void onLocationChanged(AMapLocation loc) {
			if (null != loc) {
				try {
					MapLocation.g_seltInstance.mapinfo = getLocationStr(loc);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					MapLocation.g_seltInstance.mapinfo = "";
				}
				locationClient.stopLocation();
				locationClient.onDestroy();
				//MapLocation.g_seltInstance = null;
			} else {
				MapLocation.g_seltInstance.mapinfo = "";
			}
			
			Log.d("aaaaaaaa", MapLocation.g_seltInstance.mapinfo);
		}
	};
	
	public String getLocationStr(AMapLocation location) throws JSONException{
		JSONObject json = new JSONObject();
		json.put("longitude", "" + location.getLongitude());
		json.put("latitude", "" + location.getLatitude());
		json.put("country", "" + location.getCountry());
		json.put("province", "" + location.getProvince());
		json.put("city", "" + location.getCity());
		json.put("citycode", "" + location.getCityCode());
		json.put("district", "" + location.getDistrict());
		json.put("adcode", "" + location.getAdCode());
		json.put("address", "" + location.getAddress());
		return json.toString();
	}
}
 
