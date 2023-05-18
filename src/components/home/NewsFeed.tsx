import { Fragment, useEffect, useRef, useState } from "react";
import { Collapse, Dropdown, initTE } from "tw-elements";
import { useNavigate } from "react-router-dom";
import { firestore, storage } from "../../common/appData/FireBase";
import { toast } from "react-hot-toast";
import { useAppStateAPI } from "../../common/appData/AppStateAPI";
import { APIData } from "../../common/appData/DataTypes";
import moment from "moment";

const NewsFeed: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [postText, setPostText] = useState("");
  const [postImageUrl, setPostImageUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setShowPreloader } = useAppStateAPI();
  let documentId = localStorage.getItem("documentId");

  const navigate = useNavigate();

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePostImage = async (fileInput: any) => {
    let filetype = fileInput.files[0].type;
    let file = fileInput.files[0];
    filetype = filetype.split("/")[0];
    if (filetype == "image" && documentId) {
      const storageRef = storage.ref();
      const imageRef = storageRef.child(file.name);
      await imageRef.put(file);

      // Get the download URL of the uploaded image
      const imageUrl = await imageRef.getDownloadURL();
      setPostImageUrl(imageUrl);
    } else {
      toast.error(
        "Uploaded File is not an Image. Accepted file Formats .jpg & .png"
      );
    }
  };

  const handlePost = async () => {
    let postData = {
      postImage: postImageUrl,
      postText: postText,
      postcomments: [],
      postlikes: 0,
      postCreatedData:moment().format('MMMM Do YYYY, h:mm:ss a'),
    };
    let existingPostData:APIData.UserPostDetails[] = [];
    let updateData:APIData.UserPostDetails[] = [];
    if (documentId) {
      setShowPreloader(true);
      const profileRef = firestore.collection("users").doc(documentId);
      const profileSnapshot = await profileRef.get();

        if (profileSnapshot.exists) {
          const profileData = profileSnapshot.data();
          if (profileData) {
            existingPostData = profileData["userPostData"];
          }
        }
        if(existingPostData){
          if(Array.isArray(existingPostData)){
            existingPostData = existingPostData;
          }else{
            existingPostData = [existingPostData];
          }
        }else{
          existingPostData = [];
        }
        console.log(existingPostData);
        console.log(postData);
        updateData = [...existingPostData];
        updateData.push(postData);
      profileRef
        .update({
          userPostData: updateData,
          // update more fields as needed
        })
        .then(() => {
          toast.success("Post Added Successfully");
          setImage(null);
          setPostText("");
          setPostImageUrl("");
        })
        .catch((error) => {
          toast.error(error);
        });
      setShowPreloader(false);
    }
  };
  useEffect(() => {
    initTE({ Collapse, Dropdown });
  }, []);
  return (
    <Fragment>
      <div
        className="h-screen overflow-hidden flex"
        style={{ background: "#edf2f7" }}
      >
        <div className="w-full flex flex-row flex-wrap">
          <div className="w-full bg-indigo-100 h-screen flex flex-row flex-wrap">
            {/* Begin Navbar*/}
            <div className="w-full md:w-4/4 lg:w-5/5 p-5 md:px-12 lg:24 h-full overflow-x-scroll antialiased">
              <div className="bg-white w-full shadow rounded-lg p-5">
                <div className="relative p-4">
                  <div className="mb-3">
                    <label
                      htmlFor="formFile"
                      className="mb-2 inline-block text-neutral-700 dark:text-neutral-200"
                    ></label>
                    <input
                      className="relative m-0 block w-full min-w-0 flex-auto cursor-pointer rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-xs font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:cursor-pointer file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
                      type="file"
                      ref={fileInputRef}
                      id="formFile"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e: any) => {
                        handlePostImage(e.target);
                        setImage(e.target.files[0]);
                      }}
                    />
                    {image && (
                      <img
                        src={URL.createObjectURL(image)}
                        alt="Image Preview"
                        className="h-auto max-w-sm shadow-lg dark:shadow-black/30"
                      />
                    )}
                  </div>
                  <button
                    className="float-right bg-apptheme hover:bg-apptheme text-white p-2 ml-5 rounded-lg mb-4"
                    onClick={handleButtonClick}
                  >
                    Choose Image &nbsp;
                    <i className="fa fa-paperclip" aria-hidden="true"></i>
                  </button>
                  {image && (
                    <button
                      className="float-right bg-deleteImage hover:bg-deleteImage text-white p-2 rounded-lg mb-4"
                      onClick={(e: any) => {
                        setImage(null);
                      }}
                    >
                      Remove Image &nbsp;
                      <i className="fa fa-trash" aria-hidden="true"></i>
                    </button>
                  )}
                </div>
                <textarea
                  className="bg-gray-200 w-full rounded-lg shadow border p-2"
                  rows={5}
                  value={postText}
                  placeholder="Speak your mind"
                  onChange={(e: any) => {
                    setPostText(e.target.value);
                  }}
                ></textarea>

                <div className="w-full flex flex-row flex-wrap mt-3">
                  <div className="w-3/3">
                    <button
                      onClick={(e: any) => {
                        e.preventDefault();
                        handlePost();
                      }}
                      type="button"
                      disabled={
                        postImageUrl == "" && postText == "" ? true : false
                      }
                      className="float-right bg-indigo-800 hover:bg-indigo-300 text-white p-2 rounded-lg disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-col">
                <div className="bg-white mt-3">
                  <img
                    className="border rounded-t-lg shadow-lg "
                    src="https://images.unsplash.com/photo-1572817519612-d8fadd929b00?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"
                  />
                  <div className="bg-white border shadow p-5 text-xl text-gray-700 font-semibold">
                    A Pretty Cool photo from the mountains. Image credit to
                    @danielmirlea on Unsplash.
                  </div>
                  <div className="bg-white p-1 border shadow flex flex-row flex-wrap">
                    <div className="w-1/2 hover:bg-gray-200 text-center text-xl text-gray-700 font-semibold">
                      Like
                    </div>
                    <div className="w-1/2 hover:bg-gray-200 border-l-4 text-center text-xl text-gray-700 font-semibold">
                      Comment
                    </div>
                  </div>

                  <div className="bg-white border-4 bg-gray-300 border-white rounded-b-lg shadow p-5 text-xl text-gray-700 content-center font-semibold flex flex-row flex-wrap">
                    <div className="w-full">
                      <div className="w-full text-left text-xl text-gray-600">
                        @Some Person
                      </div>
                      A Pretty Cool photo from the mountains. Image credit to
                      @danielmirlea on Unsplash. A Pretty Cool photo from the
                      mountains. Image credit to @danielmirlea on Unsplash.
                    </div>
                    <section className="w-full text-left text-xl text-gray-600 py-8">
                      <div className="w-full">
                        <form className="mb-6 w-full">
                          <div className="py-2 px-4 mb-4 bg-white rounded-lg rounded-t-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                            <label htmlFor="comment" className="sr-only">
                              Your comment
                            </label>
                            <textarea
                              id="comment"
                              rows={6}
                              className="px-0 w-full text-sm text-gray-900 border-0 focus:ring-0 focus:outline-none dark:text-white dark:placeholder-gray-400 dark:bg-gray-800"
                              placeholder="Write a comment..."
                              required
                            ></textarea>
                          </div>
                          <button
                            type="submit"
                            className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-primary-700 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800"
                          >
                            Post comment
                          </button>
                        </form>
                      </div>
                    </section>
                  </div>
                </div>

                <div className="bg-white mt-3">
                  <img
                    className="border rounded-t-lg shadow-lg "
                    src="https://images.unsplash.com/photo-1572817519612-d8fadd929b00?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"
                  />
                  <div className="bg-white border shadow p-5 text-xl text-gray-700 font-semibold">
                    A Pretty Cool photo from the mountains. Image credit to
                    @danielmirlea on Unsplash.
                  </div>
                  <div className="bg-white p-1 rounded-b-lg border shadow flex flex-row flex-wrap">
                    <div className="w-1/2 hover:bg-gray-200 text-center text-xl text-gray-700 font-semibold">
                      Like
                    </div>
                    <div className="w-1/2 hover:bg-gray-200 border-l-4 text-center text-xl text-gray-700 font-semibold">
                      Comment
                    </div>
                  </div>
                </div>

                <div className="bg-white mt-3">
                  <img
                    className="border rounded-t-lg shadow-lg "
                    src="https://images.unsplash.com/photo-1572817519612-d8fadd929b00?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80"
                  />
                  <div className="bg-white border shadow p-5 text-xl text-gray-700 font-semibold">
                    A Pretty Cool photo from the mountains. Image credit to
                    @danielmirlea on Unsplash.
                  </div>
                  <div className="bg-white p-1 rounded-b-lg border shadow flex flex-row flex-wrap">
                    <div className="w-1/2 hover:bg-gray-200 text-center text-xl text-gray-700 font-semibold">
                      Like
                    </div>
                    <div className="w-1/2 hover:bg-gray-200 border-l-4 text-center text-xl text-gray-700 font-semibold">
                      Comment
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default NewsFeed;
