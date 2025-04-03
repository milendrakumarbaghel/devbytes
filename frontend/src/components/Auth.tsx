import { SignupInput } from "@milendrakumarbaghel/blogging-site";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";


export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
    
    const [postInputs, setPostInputs] = useState<SignupInput>({
        name: "",
        email: "",
        password: "",
    });

    async function sendRequest() {
        try {
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
                postInputs
            );

            console.log("Response data:", response.data);
            const jwt = response.data?.jwt;

            localStorage.setItem("token", jwt);
            navigate("/blogs");
        } catch (e) {
            alert("Invalid credentials or Network Error");
            console.error(e);
        }
    }

    return (
        <div className="h-screen flex justify-center flex-col">
            <div className="flex justify-center">
                <div>
                    <div className="px-10">
                        <div className="text-3xl font-extrabold">
                            {type === "signup" ? "Create an Account" : "Sign In"}
                        </div>
                        <div className="text-slate-400 justify-center ml-3 mt-1">
                            {type === "signin" ? "Don't have an account?" : "Already have an account?"}
                            <Link
                                className="text-blue-500 underline pl-2 justify-center"
                                to={type === "signin" ? "/signup" : "/signin"}
                            >
                                {type === "signin" ? "Sign up" : "Sign in"}
                            </Link>
                        </div>
                    </div>
                    <div>
                        {type === "signup" ? (
                            <LabelInput
                                label="Name"
                                placeholder="John Doe"
                                onChange={(e) => {
                                    setPostInputs({
                                        ...postInputs,
                                        name: e.target.value,
                                    });
                                }}
                            />
                        ) : null}
                        <LabelInput
                            label="Email"
                            placeholder="abc@example.com"
                            onChange={(e) => {
                                setPostInputs({
                                    ...postInputs,
                                    email: e.target.value,
                                });
                            }}
                        />
                        <LabelInput
                            label="Password"
                            type="password"
                            placeholder="********"
                            onChange={(e) => {
                                setPostInputs({
                                    ...postInputs,
                                    password: e.target.value,
                                });
                            }}
                        />
                        <button
                            onClick={sendRequest}
                            type="button"
                            className="py-4 mt-2 w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-semibold rounded-lg text-base px-5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                        >
                            {type === "signup" ? "Sign Up" : "Sign In"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface LabelInputType {
    label: string;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
}

function LabelInput({ label, placeholder, type, onChange }: LabelInputType) {
    return (
        <div className="mb-4">
            <label className="block mb-2 text-sm font-semibold text-gray-900 dark:text-black">
                {label}
            </label>
            <input
                onChange={onChange}
                type={type || "text"}
                id="input"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={placeholder}
                required
            />
        </div>
    );
}
