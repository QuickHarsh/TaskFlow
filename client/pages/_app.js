import { useEffect } from 'react';
import '../styles.css';
import { ToastProvider } from '../src/components/Toast';
import SocketBridge from '../src/components/SocketBridge';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // mount side-effects if needed
  }, []);
  return (
    <ToastProvider>
      <SocketBridge />
      <Component {...pageProps} />
    </ToastProvider>
  );
}
