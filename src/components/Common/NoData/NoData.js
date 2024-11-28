import React from 'react'

const NoData = ({title = 'No data available', description = 'please add data'}) => {
    return (
        <>
            <div className="noData-wrp">
               <h4>{title}</h4>
               <p>{description}</p>
            </div>
        </>
    );
};

export default NoData
