import Taro from '@tarojs/taro';
import { View, Canvas, ScrollView } from '@tarojs/components';
import { Button, Image } from '@nutui/nutui-react-taro';
import logoPath from '../../assets/logo.png';
import { useState, useEffect } from 'react';
import UploadList from '../../components/UploadList/UploadList';
import './index.less';

const WatermarkedImage = () => {
  const [changeList, setChangeList] = useState([]); // 上传图片列表
  const [fileList, setFileList] = useState([]); // 处理后图片列表
  const [renderSuccessList, setRenderSuccessList] = useState([]); // 渲染完成的图片列表

  // 分享
  Taro.showShareMenu({
    withShareTicket: true,
  });

  // 监听 changeList
  useEffect(() => {
    if (changeList.length) {
      fileFormatList();
    } else {
      setFileList([]);
      setRenderSuccessList([]);
    }
  }, [changeList]);

  // 处理上传图片列表
  const fileFormatList = () => {
    let tempList = [];
    changeList.forEach((file, index) => {
      Taro.getImageInfo({
        src: file.path,
        success: (info) => {
          tempList.push({
            path: file.path,
            width: info.width,
            height: info.height,
            canvasId: 'watermark_id_' + index,
          });
          setFileList(tempList);
        },
      });
    });
  };

  // 绘制图片
  const drawImageWithImage = (item, logoSrc, index) => {
    const { path, canvasId, width, height } = item;

    Taro.showLoading({ title: `图片${index + 1}生成中...` }); // 显示加载提示

    // 创建canvas上下文
    const ctx = Taro.createCanvasContext(canvasId);

    // 绘制原始图片
    ctx.drawImage(path, 0, 0, width, height);

    // 绘制水印图片
    ctx.globalAlpha = 1; // 设置水印透明度

    // logo 的宽高为 400 * 200 , 需要等比例缩放
    const logoWidth = 300;
    const logoHeight = 150;

    ctx.drawImage(logoSrc, 10, 10, logoWidth, logoHeight); // 参数 x, y, width, height

    // 将绘制的内容渲染到canvas上
    ctx.draw(true, () => {
      Taro.hideLoading(); // 隐藏加载提示
      renderSuccess(canvasId, index);
    });

    Taro.hideLoading(); // 隐藏加载提示
  };

  let tempList = [];
  // 渲染完成后获取图片
  const renderSuccess = (canvasId, index) => {
    Taro.showLoading({ title: `图片${index + 1}渲染中...` }); // 显示加载提示
    Taro.canvasToTempFilePath({
      canvasId,
      success: (res) => {
        Taro.getImageInfo({
          src: res.tempFilePath,
          success: (info) => {
            tempList.push({
              path: res.tempFilePath,
              width: info.width,
              height: info.height,
            });
            setRenderSuccessList(tempList);
            Taro.hideLoading(); // 隐藏加载提示
            Taro.showToast({
              title: `图片${index + 1}生成成功`,
              icon: 'success',
              duration: 2000,
            });
          },
        });
      },
    });
  };

  // 保存图片到相册
  const handleSaveToAlbum = () => {
    fileList.forEach((item, index) => {
      Taro.showLoading({ title: `图片${index + 1} 保存相册中...` }); // 显示加载提示
      Taro.canvasToTempFilePath({
        canvasId: item.canvasId,
        success: (res) => {
          // 保存图片到相册
          Taro.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: (res) => {
              Taro.hideLoading(); // 隐藏加载提示
              Taro.showToast({
                title: `图片${index + 1}保存相册成功`,
                icon: 'success',
                duration: 2000,
              });
            },
            fail: (err) => {
              console.log(err);
            },
          });
        },
        fail: (err) => {
          console.log(err);
        },
      });
    });
  };

  // 生成水印图
  const handleGenerateWatermark = () => {
    fileList.forEach((item, index) => {
      drawImageWithImage(item, logoPath, index);
    });
  };

  return (
    <View className="watermarked_image">
      {/* 上传区 */}
      <UploadList onChange={setChangeList} />

      {/* 操作区 */}
      <View className="operation">
        <Button
          block
          size="large"
          disabled={fileList.length === 0 || renderSuccessList.length > 0}
          onClick={handleGenerateWatermark}
          type="primary">
          点击生成
        </Button>
        <Button
          block
          size="large"
          disabled={renderSuccessList.length === 0}
          onClick={handleSaveToAlbum}
          type="primary">
          保存到相册
        </Button>
      </View>

      {/* 预览区 */}
      <View className="render_content">
        <ScrollView
          style={{ height: '350px' }}
          scrollY>
          {renderSuccessList.map((img, index) => {
            return (
              <View className="render_img">
                <Image
                  lazyLoad
                  key={index}
                  src={img.path}
                  mode="aspectFit"
                  width="100%"
                  height={375}
                />
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 隐藏区 */}
      {fileList && fileList.length > 0 ? (
        <View className="canvas_water">
          {fileList.map((item) => {
            return (
              <Canvas
                canvasId={item.canvasId}
                style={{
                  width: item.width + 'px',
                  height: item.height + 'px',
                }}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

export default WatermarkedImage;
