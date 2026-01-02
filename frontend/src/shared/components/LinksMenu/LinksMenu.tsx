import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";


const LinksMenu = () => {
  return (
    <>
    <section className="flex justify-center px-4 sm:px-6">
      <div
        className=" w-full max-w-5xl bg-white border-2 border-[#c8d69b] 
        shadow-md rounded-[15px] mt-6 sm:mt-10 p-4 sm:p-6">
        <div className="flex items-center gap-3">
            <div className="sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-[#4c6fb1]">
                <Sparkles color="white"/>
            </div>
          <h3 className="font-semibold text-base sm:text-3xl">Create Short Link</h3>
        </div>
        <label className="block mt-3 text-sm sm:text-lg">
          Enter your long Url
        </label>
        <input type="text" placeholder="https://example.com/your-very-long-url" 
        className=" mt-2 w-full border-2 border-[#c8d69b] rounded-md 
        px-3 py-2 text-sm sm:text-lg outline-none focus:ring-2 focus:ring-green-600/30"
        />
        <Button className="mt-3 w-full bg-[#4c6fb1] text-sm sm:text-lg">Shorten URL</Button>
      </div>
    </section>
    </>
  );
};

export default LinksMenu;