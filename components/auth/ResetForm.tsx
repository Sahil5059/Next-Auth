//imports
"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { CardWrapper } from "./CardWrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ResetSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";
import { reset } from "@/actions/reset";
import { useState, useTransition } from "react";

//note that we are not using default in "component" exports, just for "pages" exports.
export const ResetForm = () => {
    const [ isPending, startTransition ] = useTransition();
    const [ error, setError ] = useState< string | undefined >( "" );
    const [ success, setSuccess ] = useState< string | undefined >( "" );

    const form = useForm< z.infer< typeof ResetSchema >>({
        resolver: zodResolver( ResetSchema ),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async ( values: z.infer< typeof ResetSchema >) => {
        setError( "" );
        setSuccess( "" );

        startTransition(() => {
            reset( values )
                .then(( data ) => {
                    setError( data?.error );
                    setSuccess( data?.success );
                });
        });
    }

    return (
        <CardWrapper
            headerLabel="Forgot your password?"
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
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Email
                                    </FormLabel>
                                    <FormControl>
                                        <Input 
                                            {...field}
                                            disabled={isPending}
                                            placeholder="john.doe@example.com"
                                            type="email"
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
                        Send reset email
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}