import 'bootstrap/dist/css/bootstrap.css';

export default function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

// This is the root component for all pages in the app.
// It's used to keep state when navigating between pages.
// It's also used to add global CSS styles.
