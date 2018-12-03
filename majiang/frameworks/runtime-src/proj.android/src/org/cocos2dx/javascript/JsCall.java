package org.cocos2dx.javascript;

import com.youyou.qhqp.R;
import java.io.ByteArrayOutputStream;
import java.io.File;

import org.cocos2dx.lib.Cocos2dxHelper;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;

import android.widget.Toast;
import com.youyou.qhqp.wxapi.Util;
import com.tencent.mm.sdk.modelmsg.SendAuth;
import com.tencent.mm.sdk.modelmsg.SendMessageToWX;
import com.tencent.mm.sdk.modelmsg.WXImageObject;
import com.tencent.mm.sdk.modelmsg.WXMediaMessage;
import com.tencent.mm.sdk.modelmsg.WXWebpageObject;
import android.content.pm.ActivityInfo;

import android.app.AlertDialog;
import android.content.Context;
import android.content.ClipboardManager;  
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Environment;
import android.os.StatFs;
import android.provider.MediaStore;
import android.util.Log;

public class JsCall {
static String savepath="";
static public void SwitchScreen(final int type) {
	AppActivity.g_this.runOnUiThread(new Runnable() {
		 @Override
			public void run() {
				if(type == 0) {
					AppActivity.g_this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
				} else {
					AppActivity.g_this.setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
				}
			}
	});	
}	

public static void showPickDialog(String path) {
	savepath = path;
    	
	AppActivity.g_this.runOnUiThread(new Runnable() {
            @Override
            public void run() {
            	new AlertDialog.Builder(AppActivity.g_this)
				.setTitle("澶村儚璁剧疆")
				.setNegativeButton("鐩稿唽", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						dialog.dismiss();
						Intent intent = new Intent(Intent.ACTION_PICK, null);
						intent.setDataAndType(
								MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
								"image/*");
						AppActivity.g_this.startActivityForResult(intent, 1);
						
					}
				})
				.setPositiveButton("鎷嶇収", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int whichButton) {
						dialog.dismiss();
						Intent intent = new Intent(
								MediaStore.ACTION_IMAGE_CAPTURE);
						intent.putExtra(MediaStore.EXTRA_OUTPUT, Uri
								.fromFile(new File(Environment
										.getExternalStorageDirectory(),
										"icon.jpg")));
						AppActivity.g_this.startActivityForResult(intent, 2);
						
					}
				}).show();
            }
        });

		
	}
	
	public static void exit(final String other)
	{
		AppActivity.g_this.runOnUiThread(new Runnable() {
			 @Override
		        public void run() {          
				 
				 android.app.AlertDialog.Builder a = new AlertDialog.Builder(AppActivity.g_this);
					a.setMessage("不再玩一下了吗？");
					a.setCancelable(false);
					a.setPositiveButton("玩不动了。。", new DialogInterface.OnClickListener() 
					{
						@Override
						public void onClick(DialogInterface dialog, int which)
						{
							AppActivity.g_this.runOnUiThread(new Runnable() {
						        @Override
						        public void run() {          	
						       
						        	AppActivity.g_this.runOnGLThread(new Runnable() {
							            @Override
							            public void run() {
											String rStr = "cc.director.end();";
							
							                Cocos2dxJavascriptJavaBridge.evalString(rStr);
							                
							                
							            }
							        });	
						        	AppActivity.g_this.finish();
									android.os.Process.killProcess(android.os.Process.myPid());
						        }
						    });
						}
					});
					a.setNegativeButton("那就玩一下", new DialogInterface.OnClickListener() {
						@Override
						public void onClick(DialogInterface dialog, int which) {
							dialog.cancel();
						}
						});
					
					a.show();
			 }
		});
		
		
		
	}
	
	public static void loginwx(final String other)
	{
		if (!AppActivity.wxApi.isWXAppInstalled())
    	{
//    		new Handler(m_MainActivity.getMainLooper()) {
//    			public void handleMessage(android.os.Message msg) {
//                    super.handleMessage(msg);
//            		Toast.makeText(m_MainActivity, R.string.InstallWX, Toast.LENGTH_LONG).show();
//                };    		
//            };
    		return;
    	}
    	final SendAuth.Req req = new SendAuth.Req();
        req.scope = "snsapi_message,snsapi_userinfo,snsapi_friend,snsapi_contact";
        req.state = "what state";
//        if (!GetUserString("OpenId").isEmpty())
//            req.openId = GetUserString("OpenId");

        AppActivity.wxApi.sendReq(req);
        
		
	}
	public static String getSavePath(final Context pContext) {
        String sdState = Environment.getExternalStorageState();
		String savePath = pContext.getFilesDir().getPath() + "/assets/";
		Log.e("oopp","save path 0"+savePath);
		if (sdState.equals(Environment.MEDIA_MOUNTED))
		{
			StatFs statfs = new StatFs(Environment.getExternalStorageDirectory().getPath());
			long availaBlock = statfs.getAvailableBlocks();
			long blockSize = statfs.getBlockSize();
			if(availaBlock*blockSize/1024.0f > 150000)
			{
				//savePath = Environment.getExternalStorageDirectory().getAbsolutePath();
				Log.e("oopp","save path 1"+savePath);
			}
        }
        return savePath;
    }
	
	static public void InviteFriend(String txt, String url, String title) {
    	final String path = getSavePath((Context)AppActivity.g_this) + "res/icon.png";
    	WXWebpageObject web = new WXWebpageObject();
    	web.webpageUrl = "http://xz.hbyy199.com/down/qhqp";

    	WXMediaMessage msg = new WXMediaMessage();
    	msg.setThumbImage(Util.extractThumbNail(path, 150, 150, true));
    	msg.mediaObject = web;
    	msg.description = txt;
    	msg.title = title;
    	
    	SendMessageToWX.Req req = new SendMessageToWX.Req();
    	req.transaction = buildTransaction("appdata");
    	req.message = msg;
    	req.scene = SendMessageToWX.Req.WXSceneSession;
    	AppActivity.wxApi.sendReq(req);
    }
	static public void InviteFriendSpoons(String txt, String url, String title) {
            final String path = getSavePath((Context)AppActivity.g_this) + "res/icon.png";
			WXWebpageObject web = new WXWebpageObject();
           	web.webpageUrl = "http://xz.hbyy199.com/down/qhqp";
			

            WXMediaMessage msg = new WXMediaMessage();
			Bitmap bitmap = BitmapFactory.decodeResource(AppActivity.g_this.getResources(), R.drawable.icon);
			msg.setThumbImage(bitmap);
            msg.mediaObject = web;
            msg.description = txt;
            msg.title = title;

            SendMessageToWX.Req req = new SendMessageToWX.Req();
            req.transaction = buildTransaction("appdata");
            req.message = msg;
            req.scene = SendMessageToWX.Req.WXSceneTimeline;
            AppActivity.wxApi.sendReq(req);
    }
	static public void SharePic(final String filepath) {
		
		WXImageObject img = new WXImageObject();
    	Bitmap picture = BitmapFactory.decodeFile(filepath);
    	ByteArrayOutputStream baos = new ByteArrayOutputStream();
    	picture.compress(Bitmap.CompressFormat.JPEG, 50, baos);
    	img.imageData = baos.toByteArray();
    	
    	WXMediaMessage msg = new WXMediaMessage();
    	msg.setThumbImage(Util.extractThumbNail(filepath, 150, 150, false));
    	msg.mediaObject = img;
    	msg.title = "游戏图片";
    	
    	SendMessageToWX.Req req = new SendMessageToWX.Req();
    	req.transaction = buildTransaction("appdata");
    	req.message = msg;
    	req.scene = SendMessageToWX.Req.WXSceneSession;
    	AppActivity.wxApi.sendReq(req); 
    }
	static public void SharePicSpoons(final String filepath) {
		WXImageObject img = new WXImageObject();
    	Bitmap picture = BitmapFactory.decodeFile(filepath);
    	ByteArrayOutputStream baos = new ByteArrayOutputStream();
    	picture.compress(Bitmap.CompressFormat.JPEG, 50, baos);
    	img.imageData = baos.toByteArray();
    	
    	WXMediaMessage msg = new WXMediaMessage();
    	msg.setThumbImage(Util.extractThumbNail(filepath, 150, 150, false));
    	msg.mediaObject = img;
    	msg.title = "游戏图片";
    	
    	SendMessageToWX.Req req = new SendMessageToWX.Req();
    	req.transaction = buildTransaction("appdata");
    	req.message = msg;
    	req.scene = SendMessageToWX.Req.WXSceneTimeline;
    	AppActivity.wxApi.sendReq(req); 
    }
	static public void copyStr(final String str){
		AppActivity.g_this.runOnUiThread(new Runnable() {
			 @Override
		        public void run() {
					AppActivity.g_this.copyActivity(str);
					//Toast.makeText(AppActivity.g_this, "copyStr", Toast.LENGTH_LONG).show();
				}
		});
	}
	static public void SharePicWithTransaction(final String filepath ,  String title , final String transaction ) {
		
		WXImageObject img = new WXImageObject();
    	Bitmap picture = BitmapFactory.decodeFile(filepath);
    	ByteArrayOutputStream baos = new ByteArrayOutputStream();
    	picture.compress(Bitmap.CompressFormat.JPEG, 50, baos);
    	img.imageData = baos.toByteArray();
    	
    	WXMediaMessage msg = new WXMediaMessage();
    	msg.setThumbImage(Util.extractThumbNail(filepath, 150, 150, false));
    	msg.mediaObject = img;
    	msg.title = title;
    	
    	SendMessageToWX.Req req = new SendMessageToWX.Req();
    	req.transaction = transaction;
    	req.message = msg;
    	req.scene = SendMessageToWX.Req.WXSceneSession;
    	AppActivity.wxApi.sendReq(req); 
    }
	
	
	static public void ShareWebWithTransaction(String txt, String url, String title ,final String transaction ) {
		
	 	final String path = getSavePath((Context)AppActivity.g_this) + "res/icon.png";
    	WXWebpageObject web = new WXWebpageObject();
    	web.webpageUrl = url;		    	
    	
    	WXMediaMessage msg = new WXMediaMessage();
    	msg.setThumbImage(Util.extractThumbNail(path, 150, 150, true));
    	msg.mediaObject = web;
    	msg.description = txt;
    	msg.title = title;
    	
    	SendMessageToWX.Req req = new SendMessageToWX.Req();
    	req.transaction = transaction;
    	req.message = msg;
    	req.scene = SendMessageToWX.Req.WXSceneSession;
    	AppActivity.wxApi.sendReq(req);
    }
	
	
	
	private static String buildTransaction(String type) {  
        return (type == null) ? String.valueOf(System.currentTimeMillis()) : type + System.currentTimeMillis();  
    }  
	
	static public void BeginMic(final String filepath) {
		AppActivity.g_this.runOnUiThread(new Runnable() {
			 @Override
		        public void run() {          
				 	boolean start =  AppActivity.yunvaImSdk.startAudioRecord(filepath + "hehe.amr", "lite",(byte)0);
				 	
			 }
		});
	}
	
	static public void EndMic(final String filepath) {
		AppActivity.g_this.runOnUiThread(new Runnable() {
			 @Override
		        public void run() {
				 	AppActivity.yunvaImSdk.stopAudioRecord();
			 }
		});
	}
	
	static public void CancelMic(final String filepath) {
		AppActivity.g_this.runOnUiThread(new Runnable() {
			 @Override
		        public void run() {
				 AppActivity.yunvaImSdk.stopAudioRecord();
			 }
		});
	}
	
	static public void Playurl(final String filepath) {
		AppActivity.g_this.runOnUiThread(new Runnable() {
			 @Override
		        public void run() {
					AppActivity.yunvaImSdk.playAudio(filepath, "", "");
				}
		});
	}
	
	static public String getMapInfo() {
        return 	MapLocation.getInstance().mapinfo;
    }
	
    static public String getBattery()
	{
		String rStr = "{\"curLevel\":";
		rStr += AppActivity.curLevel;
		rStr += ",";
		rStr += "\"curState\":";
		rStr += AppActivity.curState;
		rStr += "}";
		
		return rStr;
	};
	
	static public String getNetInfo() {
		ConnectivityManager connMgr = (ConnectivityManager)AppActivity.g_this.getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo networkInfo = connMgr.getActiveNetworkInfo();
		
	    int netType = 0;
		String rStr = "{\"netType\":";
		
		if( null == networkInfo)
            return "-1";
        int nType = networkInfo.getType();
        if (nType == ConnectivityManager.TYPE_MOBILE) {
			rStr += 2;
			netType = 2;
        }
        else if (nType == ConnectivityManager.TYPE_WIFI) {
            rStr += 1;
			netType = 1;
        }

		rStr += ",\"netLevel\":";
		
        //according to netType. set the value of netLevel
        switch (netType) {
        case 1:
		    rStr += AppActivity.g_this.getWifiLevel();
            break;
        case 2:
		    rStr += AppActivity.g_this.getSingnalLevel();
            break;
        default:
            break;
        }
		
		rStr += "}";

        return rStr;
	};
}
