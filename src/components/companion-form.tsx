"use client";
import { Category, Companion } from "@/generated/prisma";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageUpload } from "./image-upload";

import { DOCTOR_PROMPTS } from "@/lib/utils"; 
import { Separator } from "@radix-ui/react-dropdown-menu";

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required." }),
    description: z.string().min(1, { message: "Description is required." }),
    instructions: z.string().min(200, { message: "Instructions require at least 200 characters." }),
    seed: z.string().min(200, { message: "Seed requires at least 200 characters." }),
    src: z.string().min(1, { message: "Image is required." }),
    categoryId: z.string().min(1, { message: "Category is required" }),
});

interface CompanionFormProps {
    categories: Category[];
    initData: Companion | null;
}

export const CompanionForm = ({ categories, initData }: CompanionFormProps) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initData || {
            name: "",
            description: "",
            instructions: "",
            seed: "",
            src: "",
            categoryId: undefined,
        },
    });

    const isLoading = form.formState.isSubmitting;

    // Update instructions/seed when category changes
    useEffect(() => {
        const selectedCategory = form.watch("categoryId");
        if (selectedCategory && DOCTOR_PROMPTS[selectedCategory]) {
            const { preamble, seed, prompt } = DOCTOR_PROMPTS[selectedCategory];
            form.setValue("instructions", `${preamble}\n\n${prompt}`);
            form.setValue("seed", seed);
        }
    }, [form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (initData) {
                await axios.patch(`/api/companion/${initData.id}`, values);
            } else {
                await axios.post(`/api/companion`, values);
            }

            router.refresh();
            router.push("/");
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    return (
        <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium">General Information</h3>
                        <p className="text-sm text-muted-foreground">
                            General information about your Doctor Companion
                        </p>
                        <Separator className="bg-primary/10 my-2" />
                    </div>

                    <FormField
                        name="src"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center space-y-4">
                                <FormControl>
                                    <ImageUpload
                                        disabled={isLoading}
                                        onChange={field.onChange}
                                        value={field.value}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        disabled={isLoading}
                                        placeholder="Dr. John Smith"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        disabled={isLoading}
                                        placeholder="Experienced Cardiologist with 15 years of practice"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="categoryId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <Select
                                    disabled={isLoading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Doctor Specialty" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={category.name}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="instructions"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        rows={7}
                                        disabled={isLoading}
                                        placeholder="Detailed instructions for the doctor companion..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="seed"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Textarea
                                        rows={7}
                                        disabled={isLoading}
                                        placeholder="Example conversation with the doctor..."
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="w-full flex justify-center">
                        <Button size="lg" disabled={isLoading}>
                            {initData ? "Update Doctor Companion" : "Create Doctor Companion"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
