const LandingPage = ({ color }) => {
  console.log('Im on Client', color);
  return <h1>Landing Page</h1>;
}

// This function will be executed on the server side
// This function will not be executed on the client side

LandingPage.getInitialProps = async (context) => {
  console.log('Im on Server');
  return { color: 'red' };
}

export default LandingPage;

