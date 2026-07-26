import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAboutUser, updateProfileData } from "@/config/redux/action/authAction";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import { getImageUrl, clientServer } from "@/config";
import styles from "./style.module.css";
import Head from "next/head";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddWorkOpen, setIsAddWorkOpen] = useState(false);
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);

  // Edit Basic Profile inputs
  const [nameInput, setNameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [positionInput, setPositionInput] = useState("");

  // Add Work inputs
  const [workCompany, setWorkCompany] = useState("");
  const [workPosition, setWorkPosition] = useState("");
  const [workYears, setWorkYears] = useState("");

  // Add Education inputs
  const [eduSchool, setEduSchool] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduField, setEduField] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    dispatch(setTokenIsThere());
  }, [router, dispatch]);

  useEffect(() => {
    if (!authState.isTokenThere) return;
    const token = localStorage.getItem("token");
    dispatch(getAboutUser({ token }));
  }, [authState.isTokenThere, dispatch]);

  // Populate state when user data is fetched
  useEffect(() => {
    if (authState.user) {
      setNameInput(authState.user.userId?.name || "");
      setUsernameInput(authState.user.userId?.username || "");
      setBioInput(authState.user.bio || "");
      setPositionInput(authState.user.currentPost || "");
    }
  }, [authState.user]);

  const handleAvatarClick = () => {
    document.getElementById("avatarUpload").click();
  };

  const handleBannerClick = () => {
    document.getElementById("bannerUpload").click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);
    formData.append("token", localStorage.getItem("token"));

    try {
      await clientServer.post("/update-profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const token = localStorage.getItem("token");
      dispatch(getAboutUser({ token }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("bannerImage", file);
    formData.append("token", localStorage.getItem("token"));

    try {
      await clientServer.post("/update-profile-banner", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const token = localStorage.getItem("token");
      dispatch(getAboutUser({ token }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile banner.");
    }
  };

  const handleSaveBasicProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      // Update name/username
      await clientServer.post("/user_upload", {
        token,
        name: nameInput,
        username: usernameInput,
      });

      // Update profile bio/position
      await dispatch(
        updateProfileData({
          bio: bioInput,
          currentPost: positionInput,
          pastWork: authState.user.pastWork || [],
          education: authState.user.education || [],
        })
      );

      setIsEditProfileOpen(false);
      dispatch(getAboutUser({ token }));
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  const handleAddWork = async () => {
    if (!workCompany.trim() || !workPosition.trim() || !workYears.trim()) return;

    const newWork = {
      company: workCompany,
      position: workPosition,
      years: workYears,
    };

    const updatedWork = [...(authState.user.pastWork || []), newWork];

    await dispatch(
      updateProfileData({
        bio: authState.user.bio || "",
        currentPost: authState.user.currentPost || "",
        pastWork: updatedWork,
        education: authState.user.education || [],
      })
    );

    setWorkCompany("");
    setWorkPosition("");
    setWorkYears("");
    setIsAddWorkOpen(false);
    
    const token = localStorage.getItem("token");
    dispatch(getAboutUser({ token }));
  };

  const handleDeleteWork = async (indexToDelete) => {
    if (!window.confirm("Remove this work experience?")) return;

    const updatedWork = (authState.user.pastWork || []).filter((_, index) => index !== indexToDelete);

    await dispatch(
      updateProfileData({
        bio: authState.user.bio || "",
        currentPost: authState.user.currentPost || "",
        pastWork: updatedWork,
        education: authState.user.education || [],
      })
    );

    const token = localStorage.getItem("token");
    dispatch(getAboutUser({ token }));
  };

  const handleAddEducation = async () => {
    if (!eduSchool.trim() || !eduDegree.trim() || !eduField.trim()) return;

    const newEdu = {
      school: eduSchool,
      degree: eduDegree,
      fieldOfStudy: eduField,
    };

    const updatedEdu = [...(authState.user.education || []), newEdu];

    await dispatch(
      updateProfileData({
        bio: authState.user.bio || "",
        currentPost: authState.user.currentPost || "",
        pastWork: authState.user.pastWork || [],
        education: updatedEdu,
      })
    );

    setEduSchool("");
    setEduDegree("");
    setEduField("");
    setIsAddEducationOpen(false);

    const token = localStorage.getItem("token");
    dispatch(getAboutUser({ token }));
  };

  const handleDeleteEducation = async (indexToDelete) => {
    if (!window.confirm("Remove this education entry?")) return;

    const updatedEdu = (authState.user.education || []).filter((_, index) => index !== indexToDelete);

    await dispatch(
      updateProfileData({
        bio: authState.user.bio || "",
        currentPost: authState.user.currentPost || "",
        pastWork: authState.user.pastWork || [],
        education: updatedEdu,
      })
    );

    const token = localStorage.getItem("token");
    dispatch(getAboutUser({ token }));
  };

  const handleDownloadMyResume = async () => {
    if (!authState.user?.userId?._id) return;
    try {
      const response = await clientServer.get(`/user/download_resume?id=${authState.user.userId._id}`);
      if (response.data?.message) {
        window.open(getImageUrl(response.data.message), "_blank");
      } else {
        alert("Could not generate resume.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to download resume.");
    }
  };

  if (!authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <h2 className="pulse-animation">Synchronizing User Node Profile...</h2>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  const currentUser = authState.user;

  return (
    <UserLayout>
      <Head>
        <title>{currentUser.userId?.name || "Profile"} | LinkedIn Next</title>
        <meta name="description" content="Update and manage your cyber professional identity details." />
      </Head>

      <DashboardLayout>
        <div className={styles.container}>
          {/* PROFILE HEADER CARD */}
          <div className={styles.headerCard}>
            <div className={styles.banner}>
              {currentUser.userId?.profileBanner ? (
                <img
                  className={styles.bannerImg}
                  src={getImageUrl(currentUser.userId.profileBanner)}
                  alt="Profile Banner"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className={styles.defaultBanner}></div>
              )}
              <button
                className={styles.editBannerBtn}
                onClick={handleBannerClick}
                title="Change Cover Banner"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="16" height="16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316A2.25 2.25 0 0014.447 4H9.553a2.25 2.25 0 00-1.91 1.055l-.816 1.32z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Edit Banner</span>
              </button>
              <input
                id="bannerUpload"
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                style={{ display: "none" }}
              />
            </div>
            <div className={styles.headerBody}>
              <div className={styles.avatarWrapper} onClick={handleAvatarClick} title="Upload Profile Avatar Picture">
                <img
                  className={styles.avatar}
                  src={
                    currentUser.userId?.profilePicture
                      ? getImageUrl(currentUser.userId.profilePicture)
                      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                  }
                  alt={currentUser.userId?.name}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
                  }}
                />
                <div className={styles.avatarOverlay} title="Change Profile Photo">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="22" height="22">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316A2.25 2.25 0 0014.447 4H9.553a2.25 2.25 0 00-1.91 1.055l-.816 1.32z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input
                  id="avatarUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className={styles.headerInfo}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h1 className={styles.name}>{currentUser.userId?.name || "Full Identity Name"}</h1>
                  <p className={styles.username}>@{currentUser.userId?.username}</p>
                  <p className={styles.position}>{currentUser.currentPost || "No professional headline set"}</p>
                  <p className={styles.email}>{currentUser.userId?.email}</p>
                </div>

                <div className={styles.headerActions}>
                  <button onClick={() => setIsEditProfileOpen(true)} className={styles.editBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 21.75a4.5 4.5 0 0 1-2.01 1.258l-3.203.72a.75.75 0 0 1-.885-.885l.72-3.203a4.5 4.5 0 0 1 1.258-2.01L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                  
                  <button onClick={handleDownloadMyResume} className={styles.downloadBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span>Resume PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* BIO SECTION */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2>About bio</h2>
            </div>
            <p className={styles.bioText}>
              {currentUser.bio || "No summary provided. Edit your profile to add an about section."}
            </p>
          </div>

          {/* EXPERIENCE SECTION */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2>Experience History</h2>
              <button onClick={() => setIsAddWorkOpen(true)} className={styles.addBtn}>
                <span>+ Add Experience</span>
              </button>
            </div>

            <div className={styles.itemList}>
              {(!currentUser.pastWork || currentUser.pastWork.length === 0) ? (
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No experience listed yet.</p>
              ) : (
                currentUser.pastWork.map((work, index) => (
                  <div key={work._id || index} className={styles.item}>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemTitle}>{work.position}</span>
                      <span className={styles.itemSubtitle}>{work.company}</span>
                      <span className={styles.itemYears}>{work.years}</span>
                    </div>
                    <button onClick={() => handleDeleteWork(index)} className={styles.deleteItemBtn} aria-label="Remove experience">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* EDUCATION SECTION */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <h2>Education History</h2>
              <button onClick={() => setIsAddEducationOpen(true)} className={styles.addBtn}>
                <span>+ Add Education</span>
              </button>
            </div>

            <div className={styles.itemList}>
              {(!currentUser.education || currentUser.education.length === 0) ? (
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No education listed yet.</p>
              ) : (
                currentUser.education.map((edu, index) => (
                  <div key={edu._id || index} className={styles.item}>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemTitle}>{edu.school}</span>
                      <span className={styles.itemSubtitle}>{edu.degree} &mdash; {edu.fieldOfStudy}</span>
                    </div>
                    <button onClick={() => handleDeleteEducation(index)} className={styles.deleteItemBtn} aria-label="Remove education">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* EDIT PROFILE MODAL */}
          {isEditProfileOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h3>Edit Profile Details</h3>
                  <button onClick={() => setIsEditProfileOpen(false)} className={styles.closeModalBtn}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Username</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Professional Headline</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={positionInput}
                      placeholder="e.g. Software Engineer at Google"
                      onChange={(e) => setPositionInput(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Bio Summary</label>
                    <textarea
                      className={styles.formTextarea}
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button onClick={() => setIsEditProfileOpen(false)} className={styles.ignoreBtn}>Cancel</button>
                  <button onClick={handleSaveBasicProfile} className={styles.downloadBtn}>Save Changes</button>
                </div>
              </div>
            </div>
          )}

          {/* ADD WORK MODAL */}
          {isAddWorkOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h3>Add Work Experience</h3>
                  <button onClick={() => setIsAddWorkOpen(false)} className={styles.closeModalBtn}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Company Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={workCompany}
                      onChange={(e) => setWorkCompany(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Position Role</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={workPosition}
                      onChange={(e) => setWorkPosition(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Years / Duration</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. 2023 - Present"
                      value={workYears}
                      onChange={(e) => setWorkYears(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button onClick={() => setIsAddWorkOpen(false)} className={styles.ignoreBtn}>Cancel</button>
                  <button onClick={handleAddWork} className={styles.downloadBtn}>Add</button>
                </div>
              </div>
            </div>
          )}

          {/* ADD EDUCATION MODAL */}
          {isAddEducationOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h3>Add Education Entry</h3>
                  <button onClick={() => setIsAddEducationOpen(false)} className={styles.closeModalBtn}>&times;</button>
                </div>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>School / University</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={eduSchool}
                      onChange={(e) => setEduSchool(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Degree</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Bachelor of Science"
                      value={eduDegree}
                      onChange={(e) => setEduDegree(e.target.value)}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Field of Study</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. Computer Science"
                      value={eduField}
                      onChange={(e) => setEduField(e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button onClick={() => setIsAddEducationOpen(false)} className={styles.ignoreBtn}>Cancel</button>
                  <button onClick={handleAddEducation} className={styles.downloadBtn}>Add</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
