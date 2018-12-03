#ifndef _YVIM_CMDDEF_H__
#define _YVIM_CMDDEF_H__





/*******************************��¼ģ��********************************
*
*			              ģ������: IM_LOGIN
*
***********************************************************************/

//���޵�¼����
#define IM_LOGIN_REQ                   0x11000
namespace x11000{
	enum{
		/*uint32*/	 userid				= 1, //�û�ID
		/*string*/	 pwd				= 2, //�û�����
		/*string*/	 pgameServiceID		= 3, //��Ϸ����ID
	};
}

//���޵�¼����
#define IM_LOGIN_RESP	               0x11001
namespace x11001 {
	enum {
		/*uint32*/ result		= 1, //���ؽ�� ��Ϊ0��Ϊʧ��
		/*string*/ msg			= 2, //��������
		/*string*/ nickname		= 4, //�û��ǳ�
		/*uint32*/ userId		= 5, //�û�ID
		/*string*/ iconurl		= 6, //�û�ͼ���ַ
	};
}


//cp�˺ŵ�¼����
#define IM_THIRD_LOGIN_REQ				0x11002
namespace x11002{
	enum{
		/*string*/	 tt					= 1, //cp��¼ƾ֤
		/*string*/	 pgameServiceID		= 2, //��Ϸ����ID
	};
}

//cp�˺ŵ�¼����
#define IM_THIRD_LOGIN_RESP				 0x11003
namespace x11003 {
	enum {
		/*uint32*/ result			= 1, //���ؽ�� ��Ϊ0��Ϊʧ��
		/*string*/ msg				= 2, //��������
		/*uint32*/ userid			= 3, //����ID
		/*string*/ nickName			= 4, //�û��ǳ�
		/*string*/ iconUrl			= 5, //�û�ͼ���ַ
		/*string*/ thirdUserId		= 6, //�������û�ID
		/*string*/ thirdUserName	= 7, //�������û���
	};

}

//ע��
#define IM_LOGOUT_REQ	                  0x11004
namespace x11004
{
}




//�����ɹ�֪ͨ
#define IM_RECONNECTION_NOTIFY              0x11013
namespace x11013 {
	enum {
		/*uint32*/ userid        = 1,
	};
}

//��ȡ�������˺���Ϣ
#define IM_GET_THIRDBINDINFO_REQ            0x11014
namespace x11014 {
	enum {
		/*uint32*/ appid        = 1,   
		/*string*/ uid          = 2,
	};
}

#define IM_GET_THIRDBINDINFO_RESP           0x11015
namespace x11015 {
	enum {
		/*uint32*/ result		= 1, 
		/*string*/ msg			= 2, 
		/*uint32*/ yunvaid      = 3,   
		/*string*/ nickname     = 4,
		/*string*/ iconUrl      = 5,
		/*string*/ level        = 6,
		/*string*/ vip          = 7,
		/*string*/ ext          = 8,
	};
}

enum yv_net
{
	yv_net_disconnect = 0,
	yv_net_connect = 1,
};

//����״̬֪ͨ
#define IM_NET_STATE_NOTIFY                   0x11016
namespace x11016 {
	enum {
		/*uint8*/ state           = 1,       //yv_net
	};
}

//��ȡsdk��Ϣ
#define IM_GET_SDKINFO_REQ                    0x11017
namespace x11017 {
}

#define IM_GET_SDKINFO_RESP                   0x11018
namespace x11018 {
	enum {
		/*string*/ versions        = 1,     //�汾��
		/*uint8*/  netstate        = 2,     //����״̬
	};
}


/*******************************���ӹ���ģ��********************************
*
*			              ģ������: IM_TOOLS
*
***************************************************************************/

//��ʼ¼��(�60��)  
#define	IM_RECORD_STRART_REQ	        0x19000
namespace x19000{
	enum{
		/*string*/		strfilepath	   = 1,  //¼���ļ�����·��(.amr), Ϊ�����Զ�����  
		/*string*/      ext            = 2,  //��չ���     
		/*uint8*/       speech         = 3,  //1:¼������Զ�ʶ��
	};
}



//ֹͣ¼������  �ص�����¼���ļ�·����
#define	IM_RECORD_STOP_REQ		         0x19001


//ֹͣ¼������  �ص�����¼���ļ�·����
#define	IM_RECORD_STOP_RESP		         0x19002
namespace x19002{
	enum{
		/*uint32*/		time		     = 1,  //¼��ʱ��
		/*string*/		strfilepath      = 2,  //¼�������ļ�·����
		/*string*/      ext              = 3,  //��չ���
		/*uint32*/      result           = 4,  //0:�ɹ��� ��0ʧ��
	};
}

//����¼������
#define	IM_RECORD_STARTPLAY_REQ		     0x19003
namespace x19003{
	enum{
		/*string*/		strUrl		= 1, //¼��url
		/*string*/		strfilepath	= 2, //¼���ļ�·��, Ϊ�����Զ�����  
		/*string*/      ext         = 3,  //��չ���

	};
}

//�����������
#define	IM_RECORD_FINISHPLAY_RESP	     0x19004
namespace x19004{
	enum{
		/*uint32*/     result      = 1, //���Ž����0���ɹ�
		/*string*/     describe	   = 2, //����
		/*string*/     ext         = 3, //��չ���
	};
}

//����URL���ؽ���
#define	IM_RECORD_PLAY_PERCENT_NOTIFY     0x19016
namespace x19016{
	enum{
		/*uint8*/      percent     = 1, //����URL�����ؽ��Ȱٷֱ�
		/*string*/     ext         = 2, //��չ���

	};
}



//ֹͣ��������
#define	IM_RECORD_STOPPLAY_REQ		    0x19005
namespace x190005
{
}

enum yvspeech
{
	speech_file = 0,              //�ļ�ʶ��
	speech_file_and_url = 1,      //�ļ�ʶ�𷵻�url
	speech_url = 2,               //urlʶ��
	speech_live = 3,              //ʵʱ����ʶ��(δ���)
};

//��ʼ����ʶ��
#define IM_SPEECH_START_REQ		        0x19006
namespace x19006{
	enum{
		/*string*/	  strfilepath	= 1,  //�����ļ�
		/*string*/    ext           = 2,  //��չ���
		/*uint8*/     type          = 3,  //ʶ������ yvspeech
		/*string*/    url           = 4,  //ʶ��URL
	};
}


//����ʶ����ɷ���
#define IM_SPEECH_STOP_RESP				0x19009
namespace x19009{
	enum{
		/*uint32*/		err_id     = 1,  //0Ϊ�ɹ�
		/*string*/		err_msg    = 2,  //���صĴ�������
		/*string*/		result	   = 3,  //���
		/*string*/      ext        = 4,  //��չ���
		/*string*/      url        = 5,  //�ļ��ϴ�����URL
	};

}


//��������ʶ������
#define IM_SPEECH_SETLANGUAGE_REQ	     0x19008
namespace x19008{
	enum{
		/*uint8*/	inlanguage     = 1,     //yvimspeech_language
		/*uint8*/   outlanguage    = 2,     //yvimspeech_outlanguage
	};
}

//����ʶ������
enum yvimspeech_language
{
	im_speech_zn = 1, //����
	im_speech_ct = 2, //����
	im_speech_en = 3, //Ӣ��
};

//����ʶ�𷵻���������
enum yvimspeech_outlanguage
{
	im_speechout_simplified       = 0,  //��������
	im_speechout_traditional      = 1,  //��������
};


//�ϴ��ļ�
#define IM_UPLOAD_FILE_REQ				  0x19010
namespace x19010{
	enum{
		/*string*/		filename   = 1,   //�ļ�·��
		/*string*/      fileid     = 2,   //�ļ�ID(�ļ����ر�ʾ)
	};
}

//�ϴ��ļ���Ӧ
#define IM_UPLOAD_FILE_RESP		          0x19011
namespace x19011{
	enum{
		/*uint32*/		result	    = 1,   //���
		/*string*/      msg         = 2,   //��������
		/*string*/      fileid      = 3,   //�ļ�ID
		/*string*/      fileurl     = 4,   //�����ļ���ַ
		/*uint32*/      percent     = 5,   //��ɰٷֱ�
	};
}


//�����ļ����� 
#define IM_DOWNLOAD_FILE_REQ              0x19012
namespace x19012 {
	enum {
		/*string*/      url         = 1,   //���ص�ַ
		/*string*/      filename    = 2,   //�ļ�·��, Ϊ�����Զ�����
		/*string*/      fileid      = 3,   //�ļ�ID
	};
}

//�����ļ���Ӧ
#define IM_DOWNLOAD_FILE_RESP             0x19013
namespace x19013 {
	enum {
		/*uint32*/		result	     = 1,   //���
		/*string*/      msg          = 2,   //��������
		/*string*/      filename     = 3,   //�ļ���   
		/*string*/      fileid       = 4,   //�ļ�ID
		/*uint32*/      percent      = 5,   //��ɰٷֱ�
	};
}

//����¼����Ϣ
#define	IM_RECORD_SETINFO_REQ	           0x19014
namespace x19014{
	enum{
		/*uint32*/		times	      = 1,   //¼�����ʱ��(��)�� Ĭ��60s
		/*uint8*/       volume        = 2,   //¼�������ص��� 1�������� 0���ر�
		/*uint8*/		rate		  = 3,	 //¼�����ʣ�0:�� 1���� 2���ߣ� Ĭ��Ϊ2
	};
}

//¼��������С֪ͨ
#define	IM_RECORD_VOLUME_NOTIFY	           0x19015
namespace x19015{
	enum{
		/*string*/      ext           = 1,  //��չ���
		/*uint8*/       volume        = 2,  //������С(0-100)
	};
}


//�ж�URL�ļ��Ƿ����  
#define IM_TOOL_HAS_CACHE_FILE              0x19017
namespace x19017{
	enum
	{
		/*string*/      url             = 1, 
	};
}

//��ȡURL��Ӧ���ļ�·��
#define IM_GET_CACHE_FILE_REQ               0x19018  
namespace x19018{
	enum
	{
		/*string*/      url             = 1, 
	};
}

#define IM_GET_CACHE_FILE_RESP               0x19019 
namespace x19019{
	enum
	{
		/*uint32*/		result			= 1,   //���
		/*string*/      msg				= 2,   //��������
		/*string*/      url             = 3, 
		/*string*/      filepath        = 4,   //��ȡ�����ļ�
	};
}

//������Ի���
#define IM_CACHE_CLEAR                        0x19020
namespace x19020{

}


#endif



