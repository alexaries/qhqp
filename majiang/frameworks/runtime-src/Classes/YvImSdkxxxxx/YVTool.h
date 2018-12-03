#ifndef YunVaSDKUtils_h__
#define YunVaSDKUtils_h__

/************************************************************************/
/* �����������뵥Ԫ                                                     */
/************************************************************************/
#include <map>
#include <vector>
#include "YVTypeDef.h"
#include "CYVSyncQueue.h"
#include "yvListern.h"
namespace YVSDK
{
	//��Ϣ�ص��ṹ
	struct YAYACallBackObj;

	typedef std::vector<YAYACallBackObj*> YaYaMsgCallFuncList;
	typedef std::map<int, YaYaMsgCallFuncList> YaYaMsgMap;

	class YVTool
	{
	public:
		virtual ~YVTool(void);
		static YVTool* getInstance();

		/*��ʼ��SDK*/
		void initSDK(unsigned long appId, std::string tempPath, bool isDebug = true);

		/*CP��¼*/
		void cpLogin(std::string nickname = "1" , std::string uid = "1" );

		/*ע����¼*/
		void cpLogout();

		/*��ȡ�û����� */
		void getCPUserInfo(uint32 appid, std::string uid);

		/*ע����ش�����*/
		void registerMsgCallBack();
		void unRegisterMsgCallBack();

		/*�ͷ�SDK*/
		void releaseSDK();

		/*����¼��,��һ������Ϊ¼����ʱ����λΪ��,Ĭ����60��
		�ڶ�������Ϊ�Ƿ��ȡ¼��ʱ�ص���ע������ӿ�ֻ�е�¼�ɹ��������Ч
		*/
		void setRecord(unsigned int timeNum, bool isGetVolume);

		//��ʼ¼��, speech��0�ر�¼��ʱ�ϴ�����ʶ��1��¼��ʱ�ϴ��������ʶ��
		bool startRecord(std::string savePath, uint8 speech = 0, std::string ext = "");

		/*����¼��*/
		void stopRecord();

		/*����¼��*/  
		bool playRecord(std::string path, std::string Url, std::string ext = "");

		/*��������¼��,ע���Ʋ����ж����ص���
		һ����DownloadVoice(������UI�ϵ���ʾ����ջ�) 
		һ���ǲ��Ž����Ļص����ӵ���*/
		void playFromUrl(std::string url, std::string ext = "");

		/*��������*/
		void stopPlay();

		/*��������ʶ������*/
		void setSpeechType(yvimspeech_language inType, yvimspeech_outlanguage outType);

		/*����ʶ��,Ĭ��ʶ�𱾵ؼ�¼��, isUpLoad �Ƿ񽫱����ļ��ϴ���������*/
		void speechVoice(std::string path, std::string ext = "", bool isUpLoad = false);

		/*ͨ��url������ʶ��*/
		void speechUrl(std::string url,  std::string ext = "");

		/*�����ϴ��ļ�*/
		void upLoadFile(std::string path, std::string fileid = "");

		/*���������ļ�*/
		void downLoadFile(std::string url, std::string savePath, std::string fileid = "");

		////�����豸��Ϣ
		//void setDeviceInfo(std::string imsi, std::string imei, std::string mac,
		//	std::string appVersion, std::string networkType);

		/*ע����Ϣ����ص�*/
		template<typename T>
		void registerMsg(int cmdid, T* obj, void (T::*func)(YaYaRespondBase*));

		//���ڶ�ʱ������
		void dispatchMsg(float t);

		/*��ע��*/
		template<typename T>
		void unRegisterMsg(int cmdid, T* obj);

		inline bool isInitSDK(){ return _isSDKInit; };
	protected:
		YVTool(void);

		InitListern(Login, CPLoginResponce);
		InitListern(ReConnect, ReconnectionNotify);
		InitListern(StopRecord, RecordStopNotify);
		InitListern(FinishSpeech, SpeechStopRespond);
		InitListern(FinishPlay, StartPlayVoiceRespond);
		InitListern(UpLoadFile, UpLoadFileRespond);
		InitListern(DownLoadFile, DownLoadFileRespond);
		InitListern(NetWorkSate, NetWorkStateNotify); 
		InitListern(RecordVoice, RecordVoiceNotify);
		InitListern(CPUserInfo, GetCPUserInfoRespond);
		InitListern(DownloadVoice, DownloadVoiceRespond);
	private:
		static YVTool* _shareHandler;
		bool _isSDKInit;  //SDK�Ƿ��ʼ�����
		bool _isLoginSuccess; //CP��¼�Ƿ�ɹ�
		bool _isRecording; //����¼��
		bool _isPlaying;  //�Ƿ����ڲ���
		bool _isUsedSchedule;
		bool _lockInit;

		static YaYaMsgMap* _msgCallBackMap;

	private:
		bool sendRequeset(YaYaRequestBase* request);

		/*�����Ϣ����*/
		void cpLoginRespond(YaYaRespondBase* respond);

		/*�����ɹ�֪ͨ*/
		void reconnectionNotify(YaYaRespondBase* respond);

		/*ֹͣ¼������*/
		void stopRecordRespond(YaYaRespondBase* respond);

		/*����¼����ɷ���*/
		void finishPlayRespond(YaYaRespondBase* respond);

		/*����ʶ����ɷ���*/
		void finishSpeechRespond(YaYaRespondBase* respond);

		/*�ϴ��ļ����󷵻�*/
		void upLoadFileRespond(YaYaRespondBase* respond);

		/*�����ļ����󷵻�*/
		void downLoadFileRespond(YaYaRespondBase* respond);

		/*����״̬֪ͨ*/
		void netWorkStateRespond(YaYaRespondBase* respond);

		/*¼������֪ͨ*/
		void recordVoiceRespond(YaYaRespondBase* respond);

		/*�û���Ϣ*/
		void cpUserInfoRespond(YaYaRespondBase* respond);

		//�Ʋ��ż���ʶ���ļ�����
		void downloadVoiceRespond(YaYaRespondBase* respond);
	};
}
#endif // YunVaSDKUtils_h__

