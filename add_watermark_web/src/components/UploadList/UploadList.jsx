/* eslint-disable react/prop-types */
import { PlusOutlined } from '@ant-design/icons';
import { Upload, App } from 'antd';
import { useState } from 'react';

const UploadList = ({ onChange }) => {
  const [fileList, setFileList] = useState([]);
  const { message } = App.useApp();

  // 上传图片
  const handleChange = (e) => {
    if (e.file.status === 'done') {
      if (e.fileList.length) {
        onChange(fileList);
      } else {
        onChange([]);
      }
    } else if (e.file.status === 'error') {
      message.error('上传失败');
    }

    setFileList(e.fileList);
  };

  // 自定义上传
  const customRequest = async (option) => {
    option.onSuccess();
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: 'none',
      }}
      type="button">
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}>
        上传图片
      </div>
    </button>
  );
  return (
    <>
      <Upload
        maxCount={9}
        accept="image/*"
        listType="picture-card"
        fileList={fileList}
        multiple={true}
        customRequest={customRequest}
        onChange={handleChange}>
        {fileList.length >= 8 ? null : uploadButton}
      </Upload>
    </>
  );
};

export default UploadList;
