
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Landing from "./Landing";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to landing
    navigate("/");
  }, [navigate]);

  // If redirect fails, show landing
  return <Landing />;
};

export default Index;
