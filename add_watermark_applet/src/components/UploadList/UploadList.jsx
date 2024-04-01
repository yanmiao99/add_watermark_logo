/* eslint-disable react/prop-types */
import { Uploader } from '@nutui/nutui-react-taro';
import { Add } from '@nutui/icons-react-taro';
import { useState } from 'react';

const UploadList = ({ onChange }) => {
  const [fileList, setFileList] = useState([]); // 上传图片列表

  // 自定义上传
  const beforeXhrUpload = async (taroUploadFile, option) => {
    option.onSuccess();
  };

  // 上传
  const onSuccess = (res) => {
    if (res.files.length) {
      onChange(res.files);
    } else {
      onChange([]);
    }
    setFileList(res.files);
  };

  // 删除
  const beforeDelete = (res) => {
    const newFileList = fileList.filter((item) => item.uid !== res.uid);
    if (newFileList.length) {
      onChange(newFileList);
    } else {
      onChange([]);
    }
    setFileList(newFileList);
  };

  return (
    <Uploader
      fit="fill"
      uploadLabel="请选择图片"
      maxCount="9"
      value={fileList}
      uploadIcon={<Add />}
      sourceType={['album']}
      sizeType={['original']}
      multiple
      beforeXhrUpload={beforeXhrUpload}
      onSuccess={onSuccess}
      beforeDelete={beforeDelete}
    />
  );
};

export default UploadList;
