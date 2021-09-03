import React, { useState } from 'react';
import Header from './Header';

const PageLayout = (props) => {

    return (
        <div>
            <Header />

            <div className="container mt-4">
                {props.children}
            </div>

        </div>
    );
};

export default PageLayout;
