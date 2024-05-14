//imports
"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { CardWrapper } from "./CardWrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { NewPasswordSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";
import { newPassword } from "@/actions/newPassword";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

//note that we are not using default in "component" exports, just for "pages" exports.
export const NewPasswordForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get( "token" );
    const [ isPending, startTransition ] = useTransition();
    const [ error, setError ] = useState< string | undefined >( "" );
    const [ success, setSuccess ] = useState< string | undefined >( "" );

    const form = useForm< z.infer< typeof NewPasswordSchema >>({
        resolver: zodResolver( NewPasswordSchema ),
        defaultValues: {
            password: "",
        },
    });

    const onSubmit = async ( values: z.infer< typeof NewPasswordSchema >) => {
        setError( "" );
        setSuccess( "" );

        startTransition(() => {
            newPassword( values, token )
                .then(( data ) => {
                    setError( data?.error );
                    setSuccess( data?.success );
                });
        });
    }

    return (
        <CardWrapper
            headerLabel="Enter a new password"
            backButtonLabel="Back to login"
            backButtonHref="/auth/login"
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit( onSubmit )}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Password
                                    </FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            disabled={isPending}
                                            placeholder="******"
                                            type="password"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />  
                    </div>
                    <FormError message={error} />
                    <FormSuccess message={success} />
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full"
                    >
                        Reset password
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}