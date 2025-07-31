"use client";
import axios from "axios";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { Category, Companion } from "@prisma/client";

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { Separator } from "@radix-ui/react-dropdown-menu";

const PREAMBLE = `You are a fictional character whose name is Dr. Morgan. 
You are a compassionate and knowledgeable physician who deeply cares about your patients' well-being. 
You have a calm and reassuring demeanor, and you always listen carefully before giving thoughtful advice. 
You are dedicated to improving people's health through medical expertise, preventative care, and lifestyle guidance. 
You explain complex health topics in simple, understandable terms, and you encourage your patients to take positive steps toward healthier living. 
You balance professionalism with empathy, making your patients feel comfortable and supported.
`;


const SEED_CHAT = `Human: Hi Doctor, I've been feeling really tired lately.
Doctor: I'm glad you reached out. Can you tell me a bit more about when you usually feel the most tired?

Human: Mostly in the afternoons. Even after getting 7-8 hours of sleep, I still feel exhausted.
Doctor: Understood. Do you also experience headaches, difficulty focusing, or changes in your appetite?

Human: Yes, I've had trouble concentrating at work, and I'm not eating as much as I used to.
Doctor: That's important to note. Fatigue combined with appetite changes could be linked to stress, nutritional deficiencies, or even sleep quality issues. Have you had any recent health check-ups?

Human: Not in the last year. Do you think I should get some tests done?
Doctor: I would recommend a general blood panel to check for anemia, thyroid function, and vitamin levels. This can help rule out common causes of fatigue.

Human: Okay, that makes sense. In the meantime, is there anything I can do to improve my energy levels?
Doctor: Yes — try to maintain a regular sleep schedule, stay hydrated, and include balanced meals with protein, whole grains, and vegetables. Also, taking short breaks during work can help reduce mental fatigue.
`;

const formSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required.",
    }),
    description: z.string().min(1, {
        message: "Description is required.",
    }),
    instructions: z.string().min(200, {
        message: "Instructions require at least 200 characters."
    }),
    seed: z.string().min(200, {
        message: "Seed requires at least 200 characters."
    }),
    src: z.string().min(1, {
        message: "Image is required."
    }),
    categoryId: z.string().min(1, {
        message: "Category is required",
    }),
});

interface CompanionFormProps {
    categories: Category[];
    initData: Companion | null;
};

export const CompanionForm = ({
    categories,
    initData
}: CompanionFormProps) => {
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

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            if (initData) {
                //Update companion functionality
                await axios.patch(`/api/companion/${initData.id}`, values);
            } else {
                //create companion functionality
                await axios.post("/api/companion", values);
            }


            router.refresh();
            router.push("/");
        } catch (error) {
            console.error("Failed to save companion:", error);
        }
    };

    return (
        <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                    <div className="space-y-2 w-full col-span-2">
                        <div>
                            <h3 className="text-lg font-medium">General Information</h3>
                            <p className="text-sm text-muted-foreground">
                                General information about your Companion
                            </p>
                        </div>
                        <Separator className="bg-primary/10" />
                    </div>
                    <FormField
                        name="src"
                        render={({ field }) => (
                            <FormItem className="flex flex-col items-center justify-center space-y-4 col-span-2">
                                <FormControl>
                                    <ImageUpload disabled={isLoading} onChange={field.onChange} value={field.value} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            name="name"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className="col-span-2 md:col-span-1">
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is how your AI Companion will be named As.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="description"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input disabled={isLoading} placeholder="Short description for your AI Doctor" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Short description for your AI Companion.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select disabled={isLoading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="bg-background">
                                                <SelectValue defaultValue={field.value} placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-2 w-full">
                        <div>
                            <h3 className="text-lg font-medium">Configuration</h3>
                            <p className="text-sm text-muted-foreground">
                                Detailed instructions for AI Behaviour
                            </p>
                        </div>
                        <Separator className="bg-primary/10" />
                    </div>
                    <FormField
                        name="instructions"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Instructions</FormLabel>
                                <FormControl>
                                    <Textarea disabled={isLoading} rows={7} className="bg-background resize-none" placeholder={PREAMBLE} {...field} />
                                </FormControl>
                                <FormDescription>
                                    Describe in detail your companion&apos;s backstory and relevant details.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="seed"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Example Conversation</FormLabel>
                                <FormControl>
                                    <Textarea disabled={isLoading} rows={7} className="bg-background resize-none" placeholder={SEED_CHAT} {...field} />
                                </FormControl>
                                <FormDescription>
                                    Write couple of examples of a human chatting with your AI companion, write expected answers.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="w-full flex justify-center">
                        <Button size="lg" disabled={isLoading}>
                            {initData ? "Edit your companion" : "Create your companion"}
                            <Wand2 className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};