
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SubjectLecturesComponent from "@/components/SubjectLectures";

const SubjectLectures = () => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || userRole !== "student") {
      navigate("/");
    }
  }, [isLoggedIn, navigate, userRole]);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      <SubjectLecturesComponent />
    </div>
  );
};

export default SubjectLectures;
