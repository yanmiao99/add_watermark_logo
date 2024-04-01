<template>
  <view class="content">

    <u-upload :fileList="fileList" @afterRead="afterRead" @delete="deletePic" name="1" multiple :maxCount="9" />

    <view class="btn_group">
      <up-button type="primary" class="btn" plain @click="handleCompositeImage" :disabled="!fileList.length"
        text="合成图片" />
      <up-button type="success" class="btn" plain @click="saveImageToPhotosAlbum" :disabled="!albumList.length"
        text="保存到相册" />
    </view>

    <view class="alum_list">
      <up-image class="alum_image_item" :fade="false" v-for="(item, index) in albumList" :key="index" :src="item"
        mode="widthFix" @click="handleImagePreview(index)" />
    </view>

    <canvas canvas-id="myCanvas" :style="{
      height: canvasHeight + 'px',
      width: canvasWidth + 'px',
      opacity: 0,
      visibility: 'hidden'
    }" />

  </view>
</template>

<script setup>
import { ref } from 'vue';

const fileList = ref([]);

const canvasWidth = ref(0);
const canvasHeight = ref(0);

const albumList = ref([])

// 图片预览
const handleImagePreview = (index) => {
  uni.previewImage({
    urls: albumList.value,
    current: index
  });
}

// 删除图片
const deletePic = (event) => {
  fileList.value.splice(event.index, 1);
};

// 新增图片
const afterRead = async (event) => {
  let lists = [].concat(event.file);

  let fileListLen = fileList.value.length;

  lists.map((item) => {
    fileList.value.push({
      ...item,
      status: 'uploading',
      message: '上传中',
    });
  });

  // 上传多张图片
  Promise.all(lists.map(async (listItem) => {
    const result = await uploadFilePromise(listItem.url);
    let item = fileList.value[fileListLen];
    fileList.value.splice(fileListLen, 1, {
      ...item,
      status: 'success',
      message: '',
      url: result,
    });
    fileListLen++;
  })).then(() => {
    uni.showToast({
      title: '上传成功',
      icon: 'success',
      duration: 2000
    });
  }).catch((err) => {
    uni.showToast({
      title: err,
      icon: 'none',
      duration: 2000
    });
  });
};

// 图片上传
const uploadFilePromise = (url) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: 'https://api.zwzj66.com/api/getPicUrl',
      filePath: url,
      name: 'file',
      success: (res) => {
        let resData = JSON.parse(res.data);
        if (resData.code === 200) {
          resolve(resData.data.img_url);
        } else {
          reject(resData.msg);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

// 处理图片合成
const handleCompositeImage = () => {
  albumList.value = [];
  uni.showLoading({
    title: '图片合成中...',
    mask: true
  });
  const ctx = uni.createCanvasContext('myCanvas');
  fileList.value.forEach(item => {
    const logo = 'https://qny.weizulin.cn/images/202403251758213.png';
    const bg = item.url

    // 获取图片信息
    uni.getImageInfo({
      src: bg,
      success: (res) => {
        canvasWidth.value = res.width;
        canvasHeight.value = res.height;
        // 绘制图片
        ctx.drawImage(res.path, 0, 0, res.width, res.height); // 四个参数分别是图片路径，x轴，y轴，宽，高
        let logoWidth = res.width * 0.33;
        let logoHeight = res.height * 0.20;
        ctx.drawImage(logo, 20, 20, logoWidth, logoHeight);
        ctx.draw(false, () => { // false 表示不绘制背景色
          uni.canvasToTempFilePath({
            canvasId: 'myCanvas',
            success: (res) => {
              albumList.value = [...albumList.value, res.tempFilePath];
            },
            fail: (err) => {
              uni.showToast({
                title: err,
                icon: 'none',
                duration: 2000
              });
            }
          })
        });
      },
      fail: (err) => {
        uni.showToast({
          title: err,
          icon: 'none',
          duration: 2000
        });
      },
      complete: (complete) => {
        console.log(complete)
      },
    })
  })

  uni.hideLoading();
  uni.showToast({
    title: '合成成功',
    icon: 'success',
    duration: 2000
  });
}

// 保存图片到相册
const saveImageToPhotosAlbum = () => {

  if (!albumList.value.length) {
    uni.showToast({
      title: '请先合成图片',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  uni.showLoading({
    title: '图片保存中...',
    mask: true
  });

  albumList.value.forEach((item) => {
    uni.saveImageToPhotosAlbum({
      filePath: item,
      success: () => {
        uni.hideLoading();
        uni.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: (fail) => {
        uni.hideLoading();
        uni.showToast({
          title: '保存失败',
          icon: 'error',
          duration: 2000
        });
      },
    });
  });

  uni.hideLoading();
  uni.showToast({
    title: '保存成功',
    icon: 'success',
    duration: 2000
  });
}

</script>

<style scoped lang="scss">
.content {
  padding: 20rpx;
  box-sizing: border-box;

  .btn_group {
    display: flex;
    justify-content: space-between;
    margin-top: 20rpx;

    .btn {
      width: 48%;
    }
  }

  .alum_list {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 40rpx;

    .alum_image_item {
      width: 48%;
      margin-right: 2%;
      overflow: hidden;
      margin-bottom: 15rpx;
      border-radius: 10rpx;
    }
  }
}
</style>
