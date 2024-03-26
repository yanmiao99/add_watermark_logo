import ReactWatermark from 'react-watermark-module';
import logoPath from '@/assets/logo.png';
import { Button, Divider, App, Spin } from 'antd';
import UploadList from '@/components/UploadList/UploadList';
import { useState, useEffect } from 'react';
import './index.less';
import html2canvas from 'html2canvas';

// 转换成 base64
const fileToBase64 = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
  });
};

function AddWatermark() {
  const { message } = App.useApp();
  const [changeList, setChangeList] = useState([]);
  const [watermarkConfigList, setWatermarkConfigList] = useState([]);
  const [base64List, setBase64List] = useState([]);
  const [loading, setLoading] = useState(false);

  // 监听 changeList
  useEffect(() => {
    if (changeList.length) {
      fileToBase64List();
    } else {
      setBase64List([]);
    }
  }, [changeList]);

  // 处理 base 64
  const fileToBase64List = () => {
    const tempList = [];
    changeList.forEach(async (file) => {
      const base64 = await fileToBase64(file.originFileObj);
      tempList.push(base64);
    });
    setBase64List(tempList);
  };

  // 生成水印图
  const handleGenerateWatermark = () => {
    setLoading(true);
    let tempList = [];
    base64List.forEach((imagePath, index) => {
      tempList.push({
        ID: `watermark${index}`,
        type: 'logo',
        textPosition: 'leftTop',
        logoPath,
        imagePath,
      });
    });
    setWatermarkConfigList(tempList);
    setTimeout(() => {
      setLoading(false);
      message.success('生成水印图成功');
    }, 5000);
  };

  // 保存水印图
  const handleSaveWatermark = () => {
    setLoading(true);
    const watermarkList = document.querySelectorAll('div[id^="watermark"]');

    const canvasOption = {
      scale: window.devicePixelRatio,
      backgroundColor: 'transparent',
    };

    watermarkList.forEach((watermark, index) => {
      html2canvas(watermark, canvasOption).then((canvas) => {
        const img = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = img;
        a.download = `watermark${index}.png`;
        a.click();
        setTimeout(() => {
          setLoading(false);
          message.success('生成水印图成功');
        }, 5000);
      });
    });
  };

  return (
    <div className="add_watermark">
      <Divider>上传区</Divider>
      <UploadList onChange={setChangeList} />

      <Divider>操作区</Divider>
      <Button
        type="primary"
        disabled={changeList.length === 0}
        block
        style={{
          height: '40px',
        }}
        loading={loading}
        onClick={handleGenerateWatermark}>
        {changeList.length === 0 ? '请上传图片' : '生成水印图'}
      </Button>

      <Button
        disabled={watermarkConfigList.length === 0}
        type="primary"
        block
        style={{
          height: '40px',
          marginTop: '10px',
        }}
        loading={loading}
        onClick={handleSaveWatermark}>
        保存水印图
      </Button>

      <Divider>预览区</Divider>

      <div className="watermark_list">
        {loading ? (
          <Spin tip="加载中...">
            <div className="spin"></div>
          </Spin>
        ) : null}

        {watermarkConfigList && watermarkConfigList.length
          ? watermarkConfigList.map((watermarkConfig, index) => {
              return (
                <ReactWatermark
                  key={index}
                  {...watermarkConfig}
                />
              );
            })
          : null}
      </div>
    </div>
  );
}

export default AddWatermark;
