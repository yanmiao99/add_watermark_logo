import 'antd/dist/reset.css';
import ReactDOM from 'react-dom/client';
import AddWatermark from './pages/AddWatermark';
import { App, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ConfigProvider
    locale={zhCN}
    theme={{
      token: {
        // colorPrimary: '#F4D8E2',
      },
    }}>
    <App>
      <AddWatermark />
    </App>
  </ConfigProvider>
);
