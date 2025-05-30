
import { NavBar } from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SubjectLecturesComponent from "@/components/SubjectLectures";

const SubjectLectures = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile || profile.role !== "student") {
      navigate("/");
    }
  }, [profile, navigate]);

  return (
    <div className="min-h-screen bg-sarathi-dark text-white">
      <NavBar />
      <SubjectLecturesComponent />
    </div>
  );
};

export default SubjectLectures;
