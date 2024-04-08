import Taro from '@tarojs/taro';
import { View, Canvas, ScrollView } from '@tarojs/components';
import {
  Button,
  Image,
  Radio,
  Divider,
  Empty,
  InputNumber,
  Cell,
  ConfigProvider,
} from '@nutui/nutui-react-taro';
import blackLogoPath from '../../assets/black.png';
import whiteLogoPath from '../../assets/white.png';
import { useState, useEffect } from 'react';
import UploadList from '../../components/UploadList/UploadList';
import './index.less';

const customTheme = {
  nutuiInputnumberButtonWidth: '30px',
  nutuiInputnumberButtonHeight: '30px',
  nutuiInputnumberButtonBorderRadius: '2px',
  nutuiInputnumberButtonBackgroundColor: `#f4f4f4`,
  nutuiInputnumberInputHeight: '30px',
  nutuiInputnumberInputMargin: '0 2px',
};

const logoPositionList = [
  { label: '左上', value: 'topLeft' },
  { label: '中上', value: 'topCenter' },
  { label: '右上', value: 'topRight' },
  { label: '左中', value: 'centerLeft' },
  { label: '中间', value: 'center' },
  { label: '右中', value: 'centerRight' },
  { label: '左下', value: 'bottomLeft' },
  { label: '中下', value: 'bottomCenter' },
  { label: '右下', value: 'bottomRight' },
];

const WatermarkedImage = () => {
  const [changeList, setChangeList] = useState([]); // 上传图片列表
  const [fileList, setFileList] = useState([]); // 处理后图片列表
  const [renderSuccessList, setRenderSuccessList] = useState([]); // 渲染完成的图片列表
  const [logoColor, setLogoColor] = useState('black'); // logo 颜色
  const [logoPosition, setLogoPosition] = useState('topLeft'); // logo 位置
  const [logoCustomWidth, setLogoCustomWidth] = useState(300); // logo 宽度
  const [logoCustomHeight, setLogoCustomHeight] = useState(130); // logo 高度

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

  // 计算水印生成位置
  const getWatermarkGeneratePosition = (
    logoPosition,
    width,
    height,
    logoWidth,
    logoHeight
  ) => {
    let x = 0;
    let y = 0;

    switch (logoPosition) {
      case 'topLeft':
        x = 10;
        y = 10;
        break;
      case 'topCenter':
        x = (width - logoWidth) / 2;
        y = 10;
        break;
      case 'topRight':
        x = width - logoWidth - 10;
        y = 10;
        break;
      case 'centerLeft':
        x = 10;
        y = (height - logoHeight) / 2;
        break;
      case 'center':
        x = (width - logoWidth) / 2;
        y = (height - logoHeight) / 2;
        break;
      case 'centerRight':
        x = width - logoWidth - 10;
        y = (height - logoHeight) / 2;
        break;
      case 'bottomLeft':
        x = 10;
        y = height - logoHeight - 10;
        break;
      case 'bottomCenter':
        x = (width - logoWidth) / 2;
        y = height - logoHeight - 10;
        break;
      case 'bottomRight':
        x = width - logoWidth - 10;
        y = height - logoHeight - 10;
        break;
      default:
        x = 10;
        y = 10;
        break;
    }

    return { x, y };
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

    // logo 需要等比例缩放
    const logoWidth = Number(logoCustomWidth);
    const logoHeight = Number(logoCustomHeight);

    // 根据 logoPosition 计算 logo 的位置
    const { x, y } = getWatermarkGeneratePosition(
      logoPosition,
      width,
      height,
      logoWidth,
      logoHeight
    );

    ctx.drawImage(logoSrc, x, y, logoWidth, logoHeight); // 参数 x, y, width, height

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
    if (fileList.length === 0) {
      Taro.showToast({
        title: '暂无图片可保存',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    if (renderSuccessList.length === 0) {
      Taro.showToast({
        title: '请先生成水印图',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

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
    setRenderSuccessList([]); // 清空渲染成功列表

    if (fileList.length === 0) {
      Taro.showToast({
        title: '请先上传图片',
        icon: 'error',
        duration: 2000,
      });
      return;
    }

    fileList.forEach((item, index) => {
      const currentLogo = logoColor === 'black' ? blackLogoPath : whiteLogoPath;
      drawImageWithImage(item, currentLogo, index);
    });
  };

  return (
    <View className="watermarked_image">
      {/* 上传区 */}
      <Divider contentPosition="left">1. 上传图片</Divider>
      <UploadList onChange={setChangeList} />

      {/* 配置区 */}
      <View className="config">
        <Divider contentPosition="left">2. 选择Logo颜色</Divider>
        <Radio.Group
          defaultValue={logoColor}
          onChange={(value) => {
            setLogoColor(value);
          }}
          direction="horizontal">
          <Radio
            shape="button"
            value="black">
            黑色文字LOGO
          </Radio>
          <Radio
            shape="button"
            value="white">
            白色文字LOGO
          </Radio>
        </Radio.Group>
        <Divider contentPosition="left">3. 选择Logo位置</Divider>
        <View className="logo_position">
          <Radio.Group
            defaultValue={logoPosition}
            onChange={(value) => {
              setLogoPosition(value);
            }}
            direction="horizontal">
            {logoPositionList.map((item) => {
              return (
                <Radio
                  key={item.value}
                  shape="button"
                  value={item.value}>
                  {item.label}
                </Radio>
              );
            })}
          </Radio.Group>
        </View>
        <Divider contentPosition="left">4. 自定义Logo宽高</Divider>
        <View className="logo_custom_size">
          <ConfigProvider theme={customTheme}>
            <Cell>
              <View className="logo_custom_size_box">
                <View className="logo_custom_size_title">Logo宽度</View>
                <InputNumber
                  value={logoCustomWidth}
                  onChange={(value) => {
                    setLogoCustomWidth(value);
                  }}
                />
              </View>
            </Cell>
            <Cell>
              <View className="logo_custom_size_box">
                <View className="logo_custom_size_title">Logo高度</View>
                <InputNumber
                  value={logoCustomHeight}
                  onChange={(value) => {
                    setLogoCustomHeight(value);
                  }}
                />
              </View>
            </Cell>
          </ConfigProvider>
        </View>
      </View>

      {/* 操作区 */}
      <View className="operation">
        <Divider contentPosition="left">6. 升成水印图</Divider>
        <Button
          block
          size="large"
          onClick={handleGenerateWatermark}
          type="primary">
          点击生成
        </Button>
        <Divider contentPosition="left">7. 保存水印图到相册</Divider>
        <Button
          block
          size="large"
          onClick={handleSaveToAlbum}
          type="primary">
          保存到相册
        </Button>
      </View>

      {/* 预览区 */}
      <Divider contentPosition="left">8. 预览区</Divider>
      <View className="render_content">
        {renderSuccessList.length > 0 ? (
          <ScrollView
            style={{ height: renderSuccessList.length * 385 + 'px' }}
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
        ) : (
          <Empty
            description="暂无生成的预览图"
            style={{ marginTop: '10px' }}
            image={
              <img src="https://storage.360buyimg.com/imgtools/44f3cc10c4-0cf9a7e0-c0ac-11ee-8375-193101bb1a46.png" />
            }
          />
        )}
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
