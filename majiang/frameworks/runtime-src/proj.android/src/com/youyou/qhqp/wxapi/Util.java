package com.youyou.qhqp.wxapi;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;

import junit.framework.Assert;

import android.graphics.Bitmap;
import android.graphics.Bitmap.Config;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap.CompressFormat;
import android.util.Log;

public class Util {
	
	private static final String TAG = "SDK_Sample.Util";
	
	public static byte[] bmpToByteArray(final Bitmap bmp, final boolean needRecycle) {
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		bmp.compress(CompressFormat.PNG, 100, output);
		if (needRecycle) {
			bmp.recycle();
		}
		
		byte[] result = output.toByteArray();
		try {
			output.close();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		return result;
	}
	
	public static byte[] getHtmlByteArray(final String url) {
		 URL htmlUrl = null;     
		 InputStream inStream = null;     
		 try {         
			 htmlUrl = new URL(url);         
			 URLConnection connection = htmlUrl.openConnection();         
			 HttpURLConnection httpConnection = (HttpURLConnection)connection;         
			 int responseCode = httpConnection.getResponseCode();         
			 if(responseCode == HttpURLConnection.HTTP_OK){             
				 inStream = httpConnection.getInputStream();         
			  }     
			 } catch (MalformedURLException e) {               
				 e.printStackTrace();     
			 } catch (IOException e) {              
				e.printStackTrace();    
		  } 
		byte[] data = inputStreamToByte(inStream);

		return data;
	}
	
	public static byte[] inputStreamToByte(InputStream is) {
		try{
			ByteArrayOutputStream bytestream = new ByteArrayOutputStream();
			int ch;
			while ((ch = is.read()) != -1) {
				bytestream.write(ch);
			}
			byte imgdata[] = bytestream.toByteArray();
			bytestream.close();
			return imgdata;
		}catch(Exception e){
			e.printStackTrace();
		}
		
		return null;
	}
	
	public static byte[] readFromFile(String fileName, int offset, int len) {
		if (fileName == null) {
			return null;
		}

		File file = new File(fileName);
		if (!file.exists()) {
			Log.i(TAG, "readFromFile: file not found");
			return null;
		}

		if (len == -1) {
			len = (int) file.length();
		}

		Log.d(TAG, "readFromFile : offset = " + offset + " len = " + len + " offset + len = " + (offset + len));

		if(offset <0){
			Log.e(TAG, "readFromFile invalid offset:" + offset);
			return null;
		}
		if(len <=0 ){
			Log.e(TAG, "readFromFile invalid len:" + len);
			return null;
		}
		if(offset + len > (int) file.length()){
			Log.e(TAG, "readFromFile invalid file len:" + file.length());
			return null;
		}

		byte[] b = null;
		try {
			RandomAccessFile in = new RandomAccessFile(fileName, "r");
			b = new byte[len]; // 锟斤拷锟斤拷锟斤拷锟斤拷锟侥硷拷锟斤拷小锟斤拷锟斤拷锟斤拷
			in.seek(offset);
			in.readFully(b);
			in.close();

		} catch (Exception e) {
			Log.e(TAG, "readFromFile : errMsg = " + e.getMessage());
			e.printStackTrace();
		}
		return b;
	}
	
	private static final int MAX_DECODE_PICTURE_SIZE = 1920 * 1440;
	public static Bitmap extractThumbNail(final String path, final int height, final int width, final boolean crop) {
		Assert.assertTrue(path != null && !path.equals("") && height > 0 && width > 0);

		BitmapFactory.Options options = new BitmapFactory.Options();

		try {
			options.inJustDecodeBounds = true;
			Bitmap tmp = BitmapFactory.decodeFile(path, options);
			if (tmp != null) {
				tmp.recycle();
				tmp = null;
			}

			Log.d(TAG, "extractThumbNail: round=" + width + "x" + height + ", crop=" + crop);
			final double beY = options.outHeight * 1.0 / height;
			final double beX = options.outWidth * 1.0 / width;
			Log.d(TAG, "extractThumbNail: extract beX = " + beX + ", beY = " + beY);
			options.inSampleSize = (int) (crop ? (beY > beX ? beX : beY) : (beY < beX ? beX : beY));
			if (options.inSampleSize <= 1) {
				options.inSampleSize = 1;
			}

			// NOTE: out of memory error
			while (options.outHeight * options.outWidth / options.inSampleSize > MAX_DECODE_PICTURE_SIZE) {
				options.inSampleSize++;
			}

			int newHeight = height;
			int newWidth = width;
			if (crop) {
				if (beY > beX) {
					newHeight = (int) (newWidth * 1.0 * options.outHeight / options.outWidth);
				} else {
					newWidth = (int) (newHeight * 1.0 * options.outWidth / options.outHeight);
				}
			} else {
				if (beY < beX) {
					newHeight = (int) (newWidth * 1.0 * options.outHeight / options.outWidth);
				} else {
					newWidth = (int) (newHeight * 1.0 * options.outWidth / options.outHeight);
				}
			}

			options.inJustDecodeBounds = false;

			Log.i(TAG, "bitmap required size=" + newWidth + "x" + newHeight + ", orig=" + options.outWidth + "x" + options.outHeight + ", sample=" + options.inSampleSize);
			Bitmap bm = BitmapFactory.decodeFile(path, options);
			if (bm == null) {
				Log.e(TAG, "bitmap decode failed");
				return null;
			}

			Log.i(TAG, "bitmap decoded size=" + bm.getWidth() + "x" + bm.getHeight());
			final Bitmap scale = Bitmap.createScaledBitmap(bm, newWidth, newHeight, true);
			if (scale != null) {
				bm.recycle();
				bm = scale;
			}

			if (crop) {
				final Bitmap cropped = Bitmap.createBitmap(bm, (bm.getWidth() - width) >> 1, (bm.getHeight() - height) >> 1, width, height);
				if (cropped == null) {
					return bm;
				}

				bm.recycle();
				bm = cropped;
				Log.i(TAG, "bitmap croped size=" + bm.getWidth() + "x" + bm.getHeight());
			}
			return bm;

		} catch (final OutOfMemoryError e) {
			Log.e(TAG, "decode bitmap failed: " + e.getMessage());
			options = null;
		}

		return null;
	}
	
	public static Bitmap getThumbNail(final String path) {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		Bitmap image = BitmapFactory.decodeFile(path);
        image.compress(Bitmap.CompressFormat.JPEG, 100, baos);
        if( baos.toByteArray().length / 1024>100) {//鍒ゆ柇濡傛灉鍥剧墖澶т簬1M,杩涜鍘嬬缉閬垮厤鍦ㄧ敓鎴愬浘鐗囷紙BitmapFactory.decodeStream锛夋椂婧㈠嚭    
            baos.reset();//閲嶇疆baos鍗虫竻绌篵aos
            image.compress(Bitmap.CompressFormat.JPEG, 30, baos);//杩欓噷鍘嬬缉50%锛屾妸鍘嬬缉鍚庣殑鏁版嵁瀛樻斁鍒癰aos涓�
        }
        ByteArrayInputStream isBm = new ByteArrayInputStream(baos.toByteArray());
        BitmapFactory.Options newOpts = new BitmapFactory.Options();
        //寮�濮嬭鍏ュ浘鐗囷紝姝ゆ椂鎶妎ptions.inJustDecodeBounds 璁惧洖true浜�
        newOpts.inJustDecodeBounds = true;
        Bitmap bitmap = BitmapFactory.decodeStream(isBm, null, newOpts);
        newOpts.inJustDecodeBounds = false;
        int w = newOpts.outWidth;
        int h = newOpts.outHeight;
        //鐜板湪涓绘祦鎵嬫満姣旇緝澶氭槸800*480鍒嗚鲸鐜囷紝鎵�浠ラ珮鍜屽鎴戜滑璁剧疆涓�
        float hh = 800f;//杩欓噷璁剧疆楂樺害涓�800f
        float ww = 480f;//杩欓噷璁剧疆瀹藉害涓�480f
        //缂╂斁姣斻�傜敱浜庢槸鍥哄畾姣斾緥缂╂斁锛屽彧鐢ㄩ珮鎴栬�呭鍏朵腑涓�涓暟鎹繘琛岃绠楀嵆鍙�
        int be = 1;//be=1琛ㄧず涓嶇缉鏀�
        if (w > h && w > ww) {//濡傛灉瀹藉害澶х殑璇濇牴鎹搴﹀浐瀹氬ぇ灏忕缉鏀�
            be = (int) (newOpts.outWidth / ww);
        } else if (w < h && h > hh) {//濡傛灉楂樺害楂樼殑璇濇牴鎹搴﹀浐瀹氬ぇ灏忕缉鏀�
            be = (int) (newOpts.outHeight / hh);
        }
        if (be <= 0)
            be = 1;
        newOpts.inSampleSize = be;//璁剧疆缂╂斁姣斾緥
        newOpts.inPreferredConfig = Config.RGB_565;//闄嶄綆鍥剧墖浠嶢RGB888鍒癛GB565
        //閲嶆柊璇诲叆鍥剧墖锛屾敞鎰忔鏃跺凡缁忔妸options.inJustDecodeBounds 璁惧洖false浜�
        isBm = new ByteArrayInputStream(baos.toByteArray());
        bitmap = BitmapFactory.decodeStream(isBm, null, newOpts);
        return compressImage(bitmap);//鍘嬬缉濂芥瘮渚嬪ぇ灏忓悗鍐嶈繘琛岃川閲忓帇缂�
	}

	private static Bitmap compressImage(Bitmap image) {
		// TODO Auto-generated method stub
	    ByteArrayOutputStream baos = new ByteArrayOutputStream();
	    image.compress(Bitmap.CompressFormat.JPEG, 100, baos);//璐ㄩ噺鍘嬬缉鏂规硶锛岃繖閲�100琛ㄧず涓嶅帇缂╋紝鎶婂帇缂╁悗鐨勬暟鎹瓨鏀惧埌baos涓�
	    int options = 100;
	    while ( baos.toByteArray().length / 1024>32) {    //寰幆鍒ゆ柇濡傛灉鍘嬬缉鍚庡浘鐗囨槸鍚﹀ぇ浜�100kb,澶т簬缁х画鍘嬬缉        
	        baos.reset();//閲嶇疆baos鍗虫竻绌篵aos
	        options -= 10;//姣忔閮藉噺灏�10
	        image.compress(Bitmap.CompressFormat.JPEG, options, baos);//杩欓噷鍘嬬缉options%锛屾妸鍘嬬缉鍚庣殑鏁版嵁瀛樻斁鍒癰aos涓�
	    }
	    ByteArrayInputStream isBm = new ByteArrayInputStream(baos.toByteArray());//鎶婂帇缂╁悗鐨勬暟鎹産aos瀛樻斁鍒癇yteArrayInputStream涓�
	    Bitmap bitmap = BitmapFactory.decodeStream(isBm, null, null);//鎶夿yteArrayInputStream鏁版嵁鐢熸垚鍥剧墖
	    return bitmap;
	}
}
