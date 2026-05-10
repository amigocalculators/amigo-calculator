import Banner2 from "../components/Banner/Banner2";
// import Banner8 from "../components/Banner/Banner8";
import Banner10 from "../components/Banner/Banner10";
import Popup from "./Popup";

const Home = () => {
  return (
    <div className="pt-16 bg-[#f0efef]">
      <div className="max-w-[95rem] mx-auto ">
        {/* <Banner8 /> */}
        <Banner10 />
        <Banner2 />
        <Popup />
      </div>
    </div>
  );
};

export default Home;
