import Banner2 from '@/components/Banner/Banner2';
import Banner10 from '@/components/Banner/Banner10';
import Popup from '@/components/Popup';

export default function Home() {
  return (
    <div className="pt-16 bg-[#f0efef]">
      <div className="max-w-[95rem] mx-auto">
        <Banner10 />
        <Banner2 />
        <Popup />
      </div>
    </div>
  );
}
