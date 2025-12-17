import { useEffect } from 'react';
import '../styles.css';
import { ToastProvider } from '../src/components/Toast';
import SocketBridge from '../src/components/SocketBridge';
import Layout from '../src/components/Layout';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // mount side-effects if needed
  }, []);
  return (
    <ToastProvider>
      <SocketBridge />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ToastProvider>
  );
}
