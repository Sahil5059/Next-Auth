//imports
"use client"
import { useCallback, useEffect, useState } from "react";
import { CardWrapper } from "./CardWrapper";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { newVerification } from "@/actions/newVerification";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";

//first, open the terminal and type: "npm i react-spinners"
export const NewVerificationForm = () => {
    const [ error, setError ] = useState< string | undefined >();
    const [ success, setSuccess ] = useState< string | undefined >();
    const searchParams = useSearchParams();
    const token = searchParams.get( "token" );

    const onSubmit = useCallback(() => {
        if( success || error ) return;

        if( !token ) {
            setError( "Missing token!" );
            return;
        }
        
        newVerification( token )
            .then(( data ) => {
                setSuccess( data.success );
                setError( data.error );
            })
            .catch(() => {
                setError( "Something went wrong!" )
            });    
    }, [ token, success, error ]);

    useEffect(() => {
        onSubmit();
    }, [ onSubmit ]);

    return (
        <CardWrapper
            headerLabel="Confirming your verification"
            backButtonLabel="Back to Login"
            backButtonHref="/auth/login"
        >
            <div className="flex items-center w-full justify-center">
                {
                    !success && !error && (
                        <BeatLoader />
                    )
                }
                <FormSuccess message={success} />
                {
                    !success && (
                        <FormError message={error} />
                    )
                }
                <FormError message={error} />
            </div>       
        </CardWrapper>
    )
}