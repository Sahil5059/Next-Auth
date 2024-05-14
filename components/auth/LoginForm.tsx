//imports
"use client";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { CardWrapper } from "./CardWrapper";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoginSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../FormError";
import { FormSuccess } from "../FormSuccess";
import { login } from "@/actions/login";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";

//note that we are not using default in "component" exports, just for "pages" exports.
export const LoginForm = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get( "callbackUrl" );
    const urlError = searchParams.get( "error" )  === "OAuthAccountNotLinked" ? "Email already in use with different provider!" : "";
    const [ isPending, startTransition ] = useTransition();
    const [ error, setError ] = useState< string | undefined >( "" );
    const [ success, setSuccess ] = useState< string | undefined >( "" );
    const [ showTwoFactor, setShowTwoFactor ] = useState( false );

    const form = useForm< z.infer< typeof LoginSchema >>({
        resolver: zodResolver( LoginSchema ),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async ( values: z.infer< typeof LoginSchema >) => {
        setError( "" );
        setSuccess( "" );

        startTransition(() => {
            login( values, callbackUrl )
                .then(( data ) => {
                    if ( data?.error ) {
                        form.reset();
                        setError( data?.error );
                    }

                    if ( data?.success ) {
                        form.reset();
                        setSuccess( data?.success );
                    }

                    if ( data?.twoFactor ) {
                        setShowTwoFactor( true );
                    }
                })
                .catch (() => setError( "Something went wrong!" ));
        });
    }

    return (
        <CardWrapper
            headerLabel="Welcome Back"
            backButtonLabel="Don't have an account?"
            backButtonHref="/auth/register"
            showSocial
        >
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit( onSubmit )}
                    className="space-y-6"
                >
                    <div className="space-y-4">
                        {
                            showTwoFactor && (
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Two Factor Code
                                            </FormLabel>
                                            <FormControl>
                                                <Input 
                                                    {...field}
                                                    disabled={isPending}
                                                    placeholder="123456"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )
                        }
                        {
                            !showTwoFactor && (
                                <>
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
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        {...field}
                                                        disabled={isPending}
                                                        placeholder="******"
                                                        type="password"
                                                    />
                                                </FormControl>
                                                <Button
                                                    size="sm"
                                                    variant="link"
                                                    asChild
                                                    className="px-0 font-normal"
                                                >
                                                    <Link href="/auth/reset">
                                                        Forgot Password?
                                                    </Link>
                                                </Button>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )
                        }
                    </div>
                    <FormError message={error || urlError} />
                    <FormSuccess message={success} />
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full"
                    >
                        {
                            showTwoFactor ? "Confirm" : "Login"
                        }
                    </Button>
                </form>
            </Form>
        </CardWrapper>
    )
}