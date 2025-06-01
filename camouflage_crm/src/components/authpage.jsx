import { useLocation,Link} from "react-router-dom";
import LoginForm from "./login";
import SignupForm from "./signup";
import "../assets/css/auth.css";

 const AuthPage = () => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <div className="auth-page">
      <h2>{isLogin ? "Login" : "Create an Account"}</h2>
      {isLogin ? <LoginForm /> : <SignupForm />}
      <p>
      {isLogin
        ? <>Don’t have an account? <Link to="/signup">Sign up</Link></>
        : <>Already registered? <Link to="/login">Log in</Link></>}
    </p>
<p>
    <Link to="/">Back Home</Link>
</p>

    </div>
  );
}
export default AuthPage