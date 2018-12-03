#include "YVRespondFactory.h"
#include "YVTypeDef.h"
namespace YVSDK
{
	YVRespondFactory* YVRespondFactory::m_respondFactoryPtr = NULL;

	//�����ʺŵ�¼
	AutoRegisterRespond(IM_THIRD_LOGIN_RESP, CPLoginResponce);

	//¼��������ַ֪ͨ
	AutoRegisterRespond(IM_RECORD_STOP_RESP, RecordStopNotify);

	//�����������	
	AutoRegisterRespond(IM_RECORD_FINISHPLAY_RESP, StartPlayVoiceRespond);

	//ֹͣ����ʶ���Ӧ
	AutoRegisterRespond(IM_SPEECH_STOP_RESP, SpeechStopRespond);

	//�ϴ��ļ���Ӧ
	AutoRegisterRespond(IM_UPLOAD_FILE_RESP, UpLoadFileRespond);

	//�����ļ���Ӧ
	AutoRegisterRespond(IM_DOWNLOAD_FILE_RESP, DownLoadFileRespond);

	//����֪ͨ
	AutoRegisterRespond(IM_RECONNECTION_NOTIFY, ReconnectionNotify);

	//����״̬
	AutoRegisterRespond(IM_NET_STATE_NOTIFY, NetWorkStateNotify);

	//¼��ʱ������֪ͨ
	AutoRegisterRespond(IM_RECORD_VOLUME_NOTIFY, RecordVoiceNotify);

	//�û���Ϣ
	AutoRegisterRespond(IM_GET_THIRDBINDINFO_RESP, GetCPUserInfoRespond);

	//�Ʋ����ļ����ؽ���
	AutoRegisterRespond(IM_RECORD_PLAY_PERCENT_NOTIFY, DownloadVoiceRespond);

};