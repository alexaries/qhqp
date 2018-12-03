package com.youyou.qhqp.wxapi;

import org.cocos2dx.javascript.AppActivity;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import com.tencent.mm.sdk.constants.ConstantsAPI;
import com.tencent.mm.sdk.modelbase.BaseReq;
import com.tencent.mm.sdk.modelbase.BaseResp;
import com.tencent.mm.sdk.modelmsg.SendMessageToWX;
import com.tencent.mm.sdk.modelmsg.SendAuth;
import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.sdk.openapi.WXAPIFactory;

public class WXEntryActivity extends Activity implements IWXAPIEventHandler {

	private IWXAPI api;
	private final String APP_ID ="wxb37c53f05f4b70d4";

	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		api = WXAPIFactory.createWXAPI(this, APP_ID, false);
		api.registerApp(APP_ID);
		api.handleIntent(getIntent(), this);
	}

	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		setIntent(intent);
		api.handleIntent(intent, this);
	}

	@Override
	public void onReq(BaseReq arg0) {
	}

	@Override
	public void onResp(BaseResp arg0) {
		// Toast.makeText(this, "err:  "+arg0.errCode,
		// Toast.LENGTH_LONG).show();
		switch (arg0.getType()) {
			case ConstantsAPI.COMMAND_SENDAUTH: {
				switch (arg0.errCode) {
				case BaseResp.ErrCode.ERR_OK: {
					SendAuth.Resp result = (SendAuth.Resp) arg0;
					// call jni
					SetAccountInfo(result.code);
				}
					break;
				case BaseResp.ErrCode.ERR_USER_CANCEL:
				default: {
					// �����版�剧ず��诲��������
				}
					break;
				}
			}
				break;
			case ConstantsAPI.COMMAND_SENDMESSAGE_TO_WX:
				//SetMessaegRespInfo();
				SendMessageToWX.Resp result = (SendMessageToWX.Resp)arg0;
				
				if(BaseResp.ErrCode.ERR_OK == arg0.errCode){
					 SetMessaegRespInfo( result.transaction );
				}
				
			break;
		
		}
		finish();
	}

	private static void SetAccountInfo(final String code) {
		AppActivity.g_this.runOnUiThread(new Runnable() {
			@Override
			public void run() {

				AppActivity.g_this.runOnGLThread(new Runnable() {
					@Override
					public void run() {
						String rStr = "gameclass.mod_platform.onlogin(\"";
						rStr += code;
						rStr += "\");";
						// int ret =
						// Cocos2dxJavascriptJavaBridge.evalString("cc.log(\"test\");");
						Cocos2dxJavascriptJavaBridge.evalString(rStr);
						// int ret3 = ret +ret2;
					}
				});
			}
		});
	}
	private static void SetMessaegRespInfo(final String transaction){
		
		final String rStr = String.format("gameclass.mod_platform.onMessaegResp(\"%s\");", transaction);
		
		AppActivity.g_this.runOnUiThread(new Runnable() {
			@Override
			public void run() {

				AppActivity.g_this.runOnGLThread(new Runnable() {
					@Override
					public void run() {
						//String rStr = "gameclass.mod_platform.onMessaegResp();";
						Cocos2dxJavascriptJavaBridge.evalString(rStr);
					}
				});
			}
		});
	}
}