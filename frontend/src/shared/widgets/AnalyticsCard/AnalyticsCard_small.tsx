
import '../AnalyticsCard/AnalyticsCard_small.module.css';

const AnalyticsCard_small = () => {
    return (
        <section className="bg-white w-[300px] h-[150px] border-3 
        border-[#c8d69b] shadow-md flex flex-col justify-center m-10 p-5 rounded-[15px]">
            <div className="flex flex-row gap-3 items-center">
                <img src="dhashd"/>
                <h3>Total Clicks</h3>
            </div>
            <p>0</p>
        </section>
    )
}

export default AnalyticsCard_small;