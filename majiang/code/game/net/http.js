
var shareKey = "e32c36ea311bff152efc73508b6fd8f8";

var RequestURL = function (url,func) {
	var xhr = cc.loader.getXMLHttpRequest();

	xhr.open("GET", url);
	//set Content-type "text/plain;charset=UTF-8" to post plain text
	//xhr.setRequestHeader("Content-Type","text/plain;charset=UTF-8");

	xhr.onreadystatechange = function () {

		if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
			var httpStatus = xhr.statusText;

			func(xhr.responseText);
		}
	};
	xhr.send();
}

var PostURL = function (url,data,func,otherdata,errorhandle) {
	var xhr = cc.loader.getXMLHttpRequest();
	//cc.log(url);
	xhr.open("POST", url);
	//set Content-type "text/plain;charset=UTF-8" to post plain text
	//xhr.setRequestHeader("Content-Type","text/plain");
	xhr.setRequestHeader("Content-Type","text/plain;charset=UTF-8");
	//xhr.responseType = "arraybuffer";
	xhr.otherdata = otherdata;
	xhr.onreadystatechange = function () {

		if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
			var httpStatus = xhr.statusText;

			var buffer = xhr.response;
			cc.log("解析sssssssssss",buffer);
            //test
            var recvdata = JSON.parse(buffer);
            var msgsign = JSON.parse(recvdata.msgsign);
            if(msgsign.encode && msgsign.encode == 1) {
            	// cc.log("str="+recvdata.msgdata);
            	// cc.log("jsonStr="+JSON.stringify(recvdata.msgdata))

                var data = new Uint8Array(BASE64.decoder(recvdata.msgdata));
                recvdata.msgdata = Bytes2Str(pako.inflate(data));
            }
            var jsonData = JSON.parse(recvdata.msgdata);
            cc.log("hpptPosResponse----->msgHead:" + recvdata.msghead + "||msgData=" + recvdata.msgdata);
            //test end

			func(buffer, xhr.otherdata);
		}else{
            // if(xhr.readyState == 0){
            //     cc.log("PostURL error：初始化状态。XMLHttpRequest 对象已创建或已被 abort() 方法重置");
            // }else if(xhr.readyState == 1){
            //     cc.log("PostURL error：open() 方法已调用，但是 send() 方法未调用。请求还没有被发送");
            // }else if(xhr.readyState == 2){
            //     cc.log("PostURL error：Send() 方法已调用，HTTP 请求已发送到 Web 服务器。未接收到响应");
            // }else if(xhr.readyState == 3){
            //     cc.log("PostURL error：所有响应头部都已经接收到。响应体开始接收但未完成");
            // }
			//func(out.join(''), xhr.otherdata);

			if(errorhandle != null)
				errorhandle(xhr.otherdata);
		}
	};

	xhr.send(data);

}
var GetURLPHP = function (url,func,errorhandle) {
    var xhr = cc.loader.getXMLHttpRequest();
    cc.log("httpGet----->url:" + url);
    xhr.open("GET", url);
    //set Content-type "text/plain;charset=UTF-8" to post plain text
    //xhr.setRequestHeader("Content-Type","text/plain");
    // xhr.setRequestHeader("Content-Type","text/plain;charset=UTF-8");
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    //xhr.responseType = "arraybuffer";
    xhr.onreadystatechange = function () {

        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
            var httpStatus = xhr.statusText;
            var buffer = xhr.response;

            cc.log("getPhpGetData---->"+buffer.toString());

            func(buffer);

        }else{
            if(errorhandle != null)
                errorhandle();
        }
    };

    xhr.send();

}
var PostURLPHP = function (url,data,func,otherdata,errorhandle) {
	var xhr = cc.loader.getXMLHttpRequest();
    cc.log("httpPos----->url:" + url + "**************data---->" + data.toString());
	xhr.open("POST", url);
	//set Content-type "text/plain;charset=UTF-8" to post plain text
	//xhr.setRequestHeader("Content-Type","text/plain");
    // xhr.setRequestHeader("Content-Type","text/plain;charset=UTF-8");
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	//xhr.responseType = "arraybuffer";
	xhr.otherdata = otherdata;
	xhr.onreadystatechange = function () {

		if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
			var httpStatus = xhr.statusText;
			var buffer = xhr.response;

			cc.log("getPhpPostData---->"+buffer.toString());

			func(buffer, xhr.otherdata);

		}else{
			//func(out.join(''), xhr.otherdata);
			// cc.log("PostURL error");
			if(errorhandle != null) {
                errorhandle(xhr.otherdata);
            }
		}
	};

	xhr.send(data);

}