#ifndef YVTypeDef_h__
#define YVTypeDef_h__

#include <string>
#include <iostream>
#include <vector>
#include "IMSDK.h"
#include "YVIMCmdDef.h"
#include "yvpacket_overloaded.h"
#include <time.h>
#define  YVSDK_Version "1.0.0"

namespace YVSDK
{
	typedef unsigned int uint32;
	typedef unsigned int uint8;

	class ARef
	{
	public:
		ARef(){ _refCount = 1; }
		virtual ~ARef(){};
		void addRef(){ ++_refCount; };
		void release(){ if ((--_refCount) <= 0)delete this; }
	private:
		unsigned int _refCount;
	};

	struct YaYaRequestBase :public  ARef
	{
		virtual ~YaYaRequestBase(){};
		CmdChannel m_requestChannel;
		uint32 m_requestCmd;
		YaYaRequestBase(CmdChannel channel, uint32 cmd)
		{
			m_requestChannel = channel;
			m_requestCmd = cmd;
		}

		virtual YV_PARSER encode(){ return  yvpacket_get_parser(); }
	};

	struct YaYaRespondBase :public ARef
	{
		virtual ~YaYaRespondBase(){};
		virtual void decode(YV_PARSER parser){}
	};

	//���޵�½������Ӧ IM_LOGIN_RESP
	struct LoginResponse :YaYaRespondBase
	{
		uint32 result; //���ؽ�� ��Ϊ0��Ϊʧ��
		std::string msg; //��������
		std::string nickname; //�û��ǳ�
		uint32 userId; //�û�ID
		std::string iconurl; //�û�ͼ���ַ
		void decode(YV_PARSER parser)
		{
			result = parser_get_uint32(parser, x11001::result);
			msg = parser_get_string(parser, x11001::msg);
			nickname = parser_get_string(parser, x11001::nickname);
			userId = parser_get_uint32(parser, x11001::userId);
			iconurl = parser_get_string(parser, x11001::iconurl);
		}
	};

	//CP�˺ŵ�½����
	struct CPLoginRequest : public YaYaRequestBase
	{
		CPLoginRequest()
		:YaYaRequestBase(IM_LOGIN, IM_THIRD_LOGIN_REQ)
		{

		}
		std::string tt;  //cp��¼ƾ֤
		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			parser_set_cstring(parser, x11002::tt, tt.c_str());
			return parser;
		}
	};

	struct CPLoginResponce : public YaYaRespondBase
	{
		uint32 result; //���ؽ�� ��Ϊ0��Ϊʧ��
		std::string msg; //��������
		uint32 userid;//����ID
		std::string nickName;//�û��ǳ�
		std::string iconUrl; //�û�ͼ���ַ
		uint32 thirdUserId; //�������û�ID
		std::string thirdUserName; //�������û���
		void decode(YV_PARSER parser)
		{
			this->result = parser_get_uint32(parser, x11003::result);
			this->msg = parser_get_string(parser, x11003::msg);
			this->userid = parser_get_uint32(parser, x11003::userid);
			this->nickName = parser_get_string(parser, x11003::nickName);
			this->iconUrl = parser_get_string(parser, x11003::iconUrl);
			this->thirdUserId = parser_get_uint32(parser, x11003::thirdUserId);
			this->thirdUserName = parser_get_string(parser, x11003::thirdUserName);
		}
	};

	//ע����¼ IM_LOGOUT_REQ
	struct CPLogoutRequest :YaYaRequestBase
	{
		CPLogoutRequest()
		:YaYaRequestBase(IM_LOGIN, IM_LOGOUT_REQ)
		{

		}

		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			return parser;
		}
	};

	//����֪ͨ IM_RECONNECTION_NOTIFY
	struct ReconnectionNotify : YaYaRespondBase
	{
		uint32	userid;
		void decode(YV_PARSER parser)
		{
			userid = parser_get_uint32(parser, x11013::userid);
		}
	};

	//��ȡ������Ϣ
	struct GetCPUserInfoRequest:YaYaRequestBase
	{
		uint32 appid;
		std::string uid;

		GetCPUserInfoRequest()
		:YaYaRequestBase(IM_LOGIN, IM_GET_THIRDBINDINFO_REQ)
		{

		}

		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			parser_set_uint32(parser, x11014::appid, appid);
			parser_set_cstring(parser, x11014::uid, uid.c_str());
			return parser;
		}
	};

	//��ȡ��Ϣ��Ӧ IM_GET_THIRDBINDINFO_RESP
	struct GetCPUserInfoRespond 
		: public YaYaRespondBase
	{
		uint32 result;
		std::string msg;
		uint32 yunvaid;
		std::string nickname;
		std::string iconUrl;
		std::string level;
		std::string vip;
		std::string ext;
		
		GetCPUserInfoRespond()
			:YaYaRespondBase()
		{

		}

		void decode(YV_PARSER parser)
		{
			result = parser_get_uint32(parser, x11015::result);
			msg = parser_get_string(parser, x11015::msg);
			yunvaid = parser_get_uint32(parser, x11015::yunvaid);
			nickname = parser_get_string(parser, x11015::nickname);
			iconUrl = parser_get_string(parser, x11015::iconUrl);
			level = parser_get_string(parser, x11015::level);
			vip = parser_get_string(parser, x11015::vip);
			ext = parser_get_string(parser, x11015::ext);
		}
	};

	/****************************Ƶ������***************************/

	/****************************���߿�ʼ***************************/
	//����״̬֪ͨIM_NET_STATE_NOTIFY
	struct NetWorkStateNotify :YaYaRespondBase
	{
		yv_net state;
		void decode(YV_PARSER parser)
		{
			state = (yv_net)parser_get_uint8(parser, x11016::state);
		}
	};

	//����¼��ʱ�� IM_RECORD_SETINFO_REQ
	struct SetRecordRequest :YaYaRequestBase
	{
		uint32 times;
		uint8 volume;
		SetRecordRequest()
			:YaYaRequestBase(IM_TOOLS, IM_RECORD_SETINFO_REQ)
		{

		}

		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			parser_set_uint32(parser, x19014::times, times);
			parser_set_uint8(parser, x19014::volume, volume);
			return parser;
		}
	};
	
	//��ʼ¼��(�60��)  IM_CHANNEL_VOICEMSG_REQ	
	struct StartRecordRequest :YaYaRequestBase
	{
		std::string strFilePath;
		std::string  ext;
		uint8 speech;
		StartRecordRequest()
			:YaYaRequestBase(IM_TOOLS, IM_RECORD_STRART_REQ)
		{

		}

		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			parser_set_cstring(parser, x19000::strfilepath, strFilePath.c_str());
			parser_set_cstring(parser, x19000::ext, ext.c_str());
			parser_set_uint8(parser, x19000::speech, speech);
			return parser;
		}
	};

	//����¼��(�60��)  IM_RECORD_STOP_REQ
	struct StopRecordRequest :YaYaRequestBase
	{
		StopRecordRequest()
		:YaYaRequestBase(IM_TOOLS, IM_RECORD_STOP_REQ)
		{
		}

		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			return parser;
		}
	};

	//ֹͣ¼������  �ص�����¼���ļ�·����  IM_RECORD_STOP_RESP
	struct RecordStopNotify :YaYaRespondBase
	{
		uint32	time; //¼��ʱ��
		std::string	strfilepath; //¼�������ļ�·����
		std::string ext;
		void decode(YV_PARSER parser)
		{
			time = parser_get_uint32(parser, x19002::time);
			strfilepath = parser_get_string(parser, x19002::strfilepath);
			ext = parser_get_string(parser, x19002::ext);
		}
	};

	//¼��������С֪ͨ IM_RECORD_VOLUME_NOTIFY
	struct RecordVoiceNotify 
		:YaYaRespondBase
	{
		std::string ext;  //��չ���
		uint8       volume;  //������С(0-100)
		void decode(YV_PARSER parser)
		{
			volume = parser_get_uint8(parser, x19015::volume);
			ext = parser_get_string(parser, x19015::ext);
		}
	};

	//����¼������	IM_RECORD_STARTPLAY_REQ	
	struct StartPlayVoiceRequest :YaYaRequestBase
	{
		StartPlayVoiceRequest()
		:YaYaRequestBase(IM_TOOLS, IM_RECORD_STARTPLAY_REQ)
		{
		}
		std::string	strUrl;      // ¼��url	
		std::string	strfilepath;  //¼���ļ�
		std::string ext;
		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			parser_set_cstring(parser, x19003::strUrl, strUrl.c_str());
			parser_set_cstring(parser, x19003::strfilepath, strfilepath.c_str());
			parser_set_cstring(parser, x19003::ext, ext.c_str());
			return parser;
		}
	};

	//�����������	IM_RECORD_FINISHPLAY_RESP
	struct StartPlayVoiceRespond :YaYaRespondBase
	{
		uint32    result; //�������Ϊ 0�� ʧ��Ϊ1
		std::string    describe; //����
		std::string  ext;
		void decode(YV_PARSER parser)
		{
			result = parser_get_uint32(parser, x19004::result);
			describe = parser_get_string(parser, x19004::describe);
			ext = parser_get_string(parser, x19004::ext);
		}
	};

	//ֹͣ��������  IM_RECORD_STOPPLAY_REQ
	struct StopPlayVoiceRequest :YaYaRequestBase
	{
		StopPlayVoiceRequest()
		:YaYaRequestBase(IM_TOOLS, IM_RECORD_STOPPLAY_REQ)
		{
		}
	};

	//����ʶ������ IM_SPEECH_SETLANGUAGE_REQ
	struct SpeechSetRequest :YaYaRequestBase
	{
		SpeechSetRequest()
		:YaYaRequestBase(IM_TOOLS, IM_SPEECH_SETLANGUAGE_REQ)
		{
		}
		yvimspeech_language inLanguage;
		yvimspeech_outlanguage outLanguage;
		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			parser_set_uint8(parser, x19008::inlanguage, inLanguage);
			parser_set_uint8(parser, x19008::outlanguage, outLanguage);
			return parser;
		}
	};

	//��ʼ����ʶ�� IM_SPEECH_START_REQ	
	struct SpeechStartRequest :YaYaRequestBase
	{
		SpeechStartRequest()
		:YaYaRequestBase(IM_TOOLS, IM_SPEECH_START_REQ)
		{
		}
		std::string strfilepath;
		std::string ext;
		yvspeech   type;
		std::string    url;
		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			parser_set_cstring(parser, x19006::strfilepath, strfilepath.c_str());
			parser_set_cstring(parser, x19006::ext, ext.c_str());
			parser_set_uint8(parser, x19006::type, type);
			parser_set_cstring(parser, x19006::url, url.c_str());
			return parser;
		}
	};

	//ֹͣ����ʶ������ IM_SPEECH_STOP_REQ
	/*struct SpeechStopRequest :YaYaRequestBase
	{
	SpeechStopRequest()
	:YaYaRequestBase(IM_TOOLS, IM_SPEECH_STOP_REQ)
	{
	}
	YV_PARSER encode()
	{
	YV_PARSER parser = yvpacket_get_parser();
	return parser;
	}
	};*/

	//ֹͣ����ʶ���Ӧ IM_SPEECH_STOP_RESP	
	struct SpeechStopRespond :YaYaRespondBase
	{
		uint32		err_id;   //0Ϊ�ɹ�
		std::string		err_msg;  //���صĴ�������
		std::string		result;   //���
		std::string ext;
		std::string url;    //ʶ��ʱʹ�����ϴ����ܣ�����᷵��url
		void decode(YV_PARSER parser)
		{
			err_id = parser_get_uint32(parser, x19009::err_id);
			err_msg = parser_get_string(parser, x19009::err_msg);
			result = parser_get_string(parser, x19009::result);
			ext = parser_get_string(parser, x19009::ext);
			url = parser_get_string(parser, x19009::url);
		}
	};

	//�����ϴ��ļ�  IM_UPLOAD_FILE_REQ 
	struct UpLoadFileRequest :YaYaRequestBase
	{
		UpLoadFileRequest()
		:YaYaRequestBase(IM_TOOLS, IM_UPLOAD_FILE_REQ)
		{
		}
		std::string filename;
		std::string fileid;
		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			parser_set_cstring(parser, x19010::filename, filename.c_str());
			parser_set_cstring(parser, x19010::fileid, fileid.c_str());
			return parser;
		}
	};

	//�ϴ��ļ������Ӧ IM_UPLOAD_FILE_RESP
	struct UpLoadFileRespond :YaYaRespondBase
	{
		uint32	result;
		std::string  msg;        //��������
		std::string  fileid;     //�ļ�ID
		std::string  fileurl;    //�����ļ���ַ
		uint32  percent;    //��ɰٷֱ�

		void decode(YV_PARSER parser)
		{
			result = parser_get_uint32(parser, x19011::result);
			msg = parser_get_string(parser, x19011::msg);
			fileid = parser_get_string(parser, x19011::fileid);
			fileurl = parser_get_string(parser, x19011::fileurl);
			percent = parser_get_uint32(parser, x19011::percent);
		}
	};

	//���������ļ�  IM_DOWNLOAD_FILE_REQ 
	struct DownLoadFileRequest :YaYaRequestBase
	{
		DownLoadFileRequest()
		:YaYaRequestBase(IM_TOOLS, IM_DOWNLOAD_FILE_REQ)
		{
		}
		std::string url;
		std::string filename;
		std::string fileid;
		YV_PARSER encode()
		{
			YV_PARSER parser = yvpacket_get_parser();
			parser_set_cstring(parser, x19012::url, url.c_str());
			parser_set_cstring(parser, x19012::filename, filename.c_str());
			parser_set_cstring(parser, x19012::fileid, fileid.c_str());
			return parser;
		}
	};

	//�����ļ���Ӧ IM_DOWNLOAD_FILE_RESP 
	struct DownLoadFileRespond :YaYaRespondBase
	{
		uint32	result;     //������ 0���ɹ�������ʧ��
		std::string  msg;        //��������
		std::string  filename;   //�ļ���
		std::string  fileid;     //�ļ�ID
		uint32  percent;    //��ɰٷֱ�

		void decode(YV_PARSER parser)
		{
			result = parser_get_uint32(parser, x19013::result);
			msg = parser_get_string(parser, x19013::msg);
			filename = parser_get_string(parser, x19013::filename);
			fileid = parser_get_string(parser, x19013::fileid);
			percent = parser_get_uint32(parser, x19013::percent);
		}
	};

	//�Ʋ���ʱ�������¼�IM_RECORD_PLAY_PERCENT_NOTIFY
	struct DownloadVoiceRespond 
		: public YaYaRespondBase
	{
		uint8      percent;
		std::string     ext;

		void decode(YV_PARSER parser)
		{
			percent = parser_get_uint32(parser, x19016::percent);
			ext = parser_get_string(parser, x19016::ext);
		}
	};

	////�豸�ŵȲ���IM_DEVICE_SETINFO
	//struct SetDeviceInfoReqeust : YaYaRequestBase
	//{

	//	SetDeviceInfoReqeust()
	//	:YaYaRequestBase(IM_LOGIN, IM_DEVICE_SETINFO)
	//	{
	//	}
	//	std::string imsi;
	//	std::string imei;
	//	std::string mac;
	//	std::string appVersion;
	//	std::string networkType;

	//	YV_PARSER encode()
	//	{
	//		YV_PARSER parser = yvpacket_get_parser();
	//		parser_set_cstring(parser, x11012::imsi, imsi.c_str());
	//		parser_set_cstring(parser, x11012::imei, imei.c_str());
	//		parser_set_cstring(parser, x11012::mac, mac.c_str());
	//		parser_set_cstring(parser, x11012::appVersion, appVersion.c_str());
	//		parser_set_cstring(parser, x11012::networkType, networkType.c_str());
	//		return parser;
	//	}
	//};

	/****************************���߽���***************************/
}
#endif // YVTypeDef_h__