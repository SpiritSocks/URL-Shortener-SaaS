import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

import styles from '@/pages/ProfilePage/ProfilePage.module.css';

const ProfilePage = () => {
    const navigate = useNavigate();

    const inputs = [
        {icon: 1, title: "Name", placeholder: "John Doe"},
        {icon: 2, title: "Email", placeholder: "john.doe@email.com"},
        {icon: 3, title: "Company", placeholder: "Growth Marketing Co."},
        {icon: 4, title: "Website", placeholder: "www.growthmarketing.com"},
    ];

    const inputFields = inputs.map(({ icon, title, placeholder }) => (
        <div key={icon}>
            <h3>{title}</h3>
            <input 
                className={styles.profile_input} 
                type="text" 
                placeholder={placeholder}
                />
        </div>
    ));

    return (
        <div className="min-h-screen bg-[#FAFAF5] font-sans">
        <section className="flex flex-col max-w-[70%] mx-auto justify-center gap-5 mt-10">
            <Button
                variant="ghost"
                onClick={() => navigate('/home')}
                className="self-start mb-2 -ml-2"
                data-testid="button-back"
            >
                ← Back
            </Button>
            <div>
            <h1 className="text-sm md:text-3xl font-bold" data-testid="heading-profile">Profile</h1>
            <p data-testid="text-profile-desc">Manage your account information and preferences</p>
            </div>
            <div className="grid grid-cols-3 grid-rows-2 gap-4 min-h-100 min-w-auto ">
            <div className="col-span-2 row-span-2 bg-white border-[#c8d69b] border-3 shadow-md rounded-[15px] p-6" data-testid="card-user-info">
                <div className="flex justify-between mb-8">
                <div className="flex flex-row items-center gap-3">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="John Doe" className="w-8 h-8 rounded-full" data-testid="img-avatar" />
                    <h2 className="text-[15px] font-medium text-[#111111]" data-testid="text-username">John Doe</h2>
                </div>
                <Button className="bg-[#111111] hover:bg-black text-white" data-testid="button-edit-profile">Edit</Button>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full justify-center">
                {inputFields}
                </div>
            </div>
            <div className="col-start-3 bg-white border-[#c8d69b] border-3 shadow-md rounded-[15px] p-5 flex items-start justify-start text-[13px] font-medium" data-testid="card-account-stats">
                Account stats
            </div>
            <div className="col-start-3 bg-white border-[#c8d69b] border-3 shadow-md rounded-[15px] p-5 flex items-start justify-start text-[13px] font-medium" data-testid="card-current-plan">
                Current Plan
            </div>
            </div>
        </section>
        </div>
    );
}

export default ProfilePage;