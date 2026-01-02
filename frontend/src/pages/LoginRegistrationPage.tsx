import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input";

const LoginRegistrationPage = () => {
    return (
        <>
        <section id="login_form" className="min-w-md flex justify-center items-center h-screen ">
            <FieldSet className="w-full max-w-md p-6 border-3 border-[#c8d69b] rounded-xl bg-white">
                <FieldGroup className="flex flex-row justify-center">
                    <Button className="w-[150px]">Login</Button>
                    <Button className="w-[150px]">Register</Button>
                </FieldGroup>
                <FieldSeparator/>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="userEmail">Email Adress</FieldLabel>
                        <Input id="userEmail" type="email" placeholder="example@mail.com" className="border-2 border-[#c8d69b]"/>
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input id="password" type="password" placeholder="••••••••••" className="border-2 border-[#c8d69b]"/>
                        <FieldDescription>
                            Must be at least 8 characters long.
                        </FieldDescription>
                    </Field>
                    <Button className="bg-[#3971b8]">Login</Button>
                </FieldGroup>
                <FieldSeparator>Or continue with</FieldSeparator>
                <FieldGroup className="grid grid-cols-3">
                    <Button className="bg-transparent border-2 border-[#c8d69b] text-black">Google</Button>
                    <Button className="bg-transparent border-2 border-[#c8d69b] text-black">Github</Button>
                    <Button className="bg-transparent border-2 border-[#c8d69b] text-black">VK</Button>
                </FieldGroup>
            </FieldSet>
        </section>
        </>
    )
}

export default LoginRegistrationPage;