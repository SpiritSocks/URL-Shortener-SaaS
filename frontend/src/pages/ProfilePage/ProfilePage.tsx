import { Button } from "@/components/ui/button";

import styles from '@/pages/ProfilePage/ProfilePage.module.css';

const ProfilePage = () => {

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
        <>
        <section className="flex flex-col max-w-[70%] mx-auto justify-center gap-5 mt-10">
            <div>
                <h1 className="text-sm md:text-3xl font-bold">Profile</h1>
                <p>Manage your account information and preferences</p>
            </div>
            <div className="grid grid-cols-3 grid-rows-2 gap-4 min-h-100 min-w-auto ">
                <div className="col-span-2 row-span-2 bg-white border-[#c8d69b] border-3 shadow-md rounded-[15px] p-6">
                    <div className="flex justify-between">
                        <div className="flex flex-row">
                            <img src="sdad"/>
                            <h2>John Doe</h2>
                        </div>
                        <Button>Edit</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full justify-center">
                        {inputFields}
                    </div>
                </div>
                <div className="col-start-3 bg-white border-[#c8d69b] border-3 shadow-md rounded-[15px]">Account stats</div>
                <div className="col-start-3 bg-white border-[#c8d69b] border-3 shadow-md rounded-[15px]">Current Plan</div>
            </div>
        </section>
        </>
    )
}

export default ProfilePage;