import { useState, useRef, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import JoditEditor from 'jodit-react';
import { supabase } from '@/utils/supabase/client';

export default function UploadQuestion() {
    const editor = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const editorConfig = useMemo(() => ({
        readonly: false,
        height: 300,
        placeholder: 'Start writing the question description...',
    }), []);

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            let basePoints = 0;
            if (data.round === 'Rapid Fire') basePoints = 10;
            else if (data.round === 'Coding Cascade') basePoints = 25;
            else if (data.round === 'Hardcore DSA') basePoints = 100;

            // STEP 1: Insert into the 'questions' table
            const { data: questionData, error: questionError } = await supabase
                .from('questions')
                .insert([
                    {
                        title: data.title,
                        description: data.description,
                        input_format: data.inputFormat,
                        output_format: data.outputFormat,
                        constraints: data.constraints,
                        example_1_input: data.example1Input,
                        example_1_output: data.example1Output,
                        example_2_input: data.example2Input,
                        example_2_output: data.example2Output,
                        round: data.round,
                        base_points: basePoints,
                        avg_time: 180,
                        sequence_order: 0,
                    },
                ])
                .select('id')
                .single();

            if (questionError) throw questionError;

            const questionId = questionData.id;

            // STEP 2: Insert into the 'test_cases' table (Hidden test cases)
            const testCasesToInsert = [
                {
                    question_id: questionId,
                    input_data: data.hidden1Input,
                    output_data: data.hidden1Output,
                    is_hidden: true,
                },
                {
                    question_id: questionId,
                    input_data: data.hidden2Input,
                    output_data: data.hidden2Output,
                    is_hidden: true,
                },
                {
                    question_id: questionId,
                    input_data: data.hidden3Input,
                    output_data: data.hidden3Output,
                    is_hidden: true,
                },
            ];

            const { error: testCasesError } = await supabase
                .from('test_cases')
                .insert(testCasesToInsert);

            if (testCasesError) throw testCasesError;

            setSuccessMessage('Question and test cases uploaded successfully!');
            reset();
        } catch (error) {
            console.error('Error uploading question:', JSON.stringify(error, null, 2));
            setErrorMessage(
                error?.message ||
                error?.error_description ||
                JSON.stringify(error) ||
                'An unexpected error occurred.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass =
        'w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition';
    const labelClass = 'block text-sm font-medium text-gray-700 mb-1';
    const errorClass = 'text-red-500 text-sm mt-1';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Upload New Question
                </h1>

                {successMessage ? (
                    <div className="my-8 py-12 px-6 bg-green-50 rounded-2xl border border-green-200 text-center shadow-sm">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg
                                className="w-10 h-10 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="3"
                                    d="M5 13l4 4L19 7"
                                ></path>
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-green-800 mb-4">
                            Upload Successful!
                        </h2>
                        <p className="text-green-700 text-lg mb-8">{successMessage}</p>
                        <button
                            onClick={() => setSuccessMessage('')}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Add Next Question
                        </button>
                    </div>
                ) : (
                    <>
                        {errorMessage && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit, (validationErrors) => {
                            console.log('Validation errors:', validationErrors);
                            setErrorMessage('Please fill in all required fields.');
                        })} className="space-y-8">
                            {/* Main Question Details Section */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                                    1. Question Details
                                </h2>

                                <div>
                                    <label className={labelClass}>Round Name</label>
                                    <select
                                        {...register('round', { required: 'Round is required' })}
                                        className={`${inputClass} bg-white`}
                                    >
                                        <option value="">Select a round</option>
                                        <option value="Rapid Fire">Rapid Fire (10 pts)</option>
                                        <option value="Coding Cascade">Coding Cascade (25 pts)</option>
                                        <option value="Hardcore DSA">Hardcore DSA (100 pts)</option>
                                    </select>
                                    {errors.round && (
                                        <p className={errorClass}>{errors.round.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>Question Title</label>
                                    <input
                                        type="text"
                                        {...register('title', { required: 'Title is required' })}
                                        className={inputClass}
                                        placeholder="e.g. Two Sum"
                                    />
                                    {errors.title && (
                                        <p className={errorClass}>{errors.title.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className={labelClass}>Question Description</label>
                                    <div className="prose-sm max-w-none">
                                        <Controller
                                            name="description"
                                            control={control}
                                            rules={{ required: 'Description is required' }}
                                            render={({ field }) => (
                                                <JoditEditor
                                                    ref={editor}
                                                    value={field.value || ''}
                                                    config={editorConfig}
                                                    tabIndex={1}
                                                    onBlur={(newContent) => field.onChange(newContent)}
                                                    onChange={() => { }}
                                                />
                                            )}
                                        />
                                    </div>
                                    {errors.description && (
                                        <p className={errorClass}>{errors.description.message}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>Input Format</label>
                                        <textarea
                                            {...register('inputFormat', {
                                                required: 'Input format is required',
                                            })}
                                            className={`${inputClass} h-32`}
                                            placeholder="Describe the input format..."
                                        />
                                        {errors.inputFormat && (
                                            <p className={errorClass}>{errors.inputFormat.message}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className={labelClass}>Output Format</label>
                                        <textarea
                                            {...register('outputFormat', {
                                                required: 'Output format is required',
                                            })}
                                            className={`${inputClass} h-32`}
                                            placeholder="Describe the output format..."
                                        />
                                        {errors.outputFormat && (
                                            <p className={errorClass}>{errors.outputFormat.message}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Constraints</label>
                                    <textarea
                                        {...register('constraints', {
                                            required: 'Constraints are required',
                                        })}
                                        className={`${inputClass} h-24`}
                                        placeholder="e.g. 1 <= N <= 10^5"
                                    />
                                    {errors.constraints && (
                                        <p className={errorClass}>{errors.constraints.message}</p>
                                    )}
                                </div>
                            </section>

                            {/* Public Example Test Cases Section */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                                    2. Example Test Cases (Public)
                                </h2>

                                <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                                    <h3 className="font-medium text-blue-800">
                                        Example Test Case 1
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Input</label>
                                            <textarea
                                                {...register('example1Input', {
                                                    required: 'Example 1 Input is required',
                                                })}
                                                className={`${inputClass} font-mono text-sm h-24`}
                                            />
                                            {errors.example1Input && (
                                                <p className={errorClass}>
                                                    {errors.example1Input.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Output</label>
                                            <textarea
                                                {...register('example1Output', {
                                                    required: 'Example 1 Output is required',
                                                })}
                                                className={`${inputClass} font-mono text-sm h-24`}
                                            />
                                            {errors.example1Output && (
                                                <p className={errorClass}>
                                                    {errors.example1Output.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                                    <h3 className="font-medium text-blue-800">
                                        Example Test Case 2
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Input</label>
                                            <textarea
                                                {...register('example2Input', {
                                                    required: 'Example 2 Input is required',
                                                })}
                                                className={`${inputClass} font-mono text-sm h-24`}
                                            />
                                            {errors.example2Input && (
                                                <p className={errorClass}>
                                                    {errors.example2Input.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Output</label>
                                            <textarea
                                                {...register('example2Output', {
                                                    required: 'Example 2 Output is required',
                                                })}
                                                className={`${inputClass} font-mono text-sm h-24`}
                                            />
                                            {errors.example2Output && (
                                                <p className={errorClass}>
                                                    {errors.example2Output.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Hidden Test Cases Section */}
                            <section className="space-y-6">
                                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">
                                    3. Hidden Test Cases (For Evaluation)
                                </h2>

                                <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                                    <h3 className="font-medium text-gray-800">
                                        Hidden Test Case 1
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Input</label>
                                            <textarea
                                                {...register('hidden1Input', {
                                                    required: 'Hidden 1 Input is required',
                                                })}
                                                className={`${inputClass} font-mono text-sm h-24`}
                                            />
                                            {errors.hidden1Input && (
                                                <p className={errorClass}>
                                                    {errors.hidden1Input.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Output</label>
                                            <textarea
                                                {...register('hidden1Output', {
                                                    required: 'Hidden 1 Output is required',
                                                })}
                                                className={`${inputClass} font-mono text-sm h-24`}
                                            />
                                            {errors.hidden1Output && (
                                                <p className={errorClass}>
                                                    {errors.hidden1Output.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                                    <h3 className="font-medium text-gray-800">
                                        Hidden Test Case 2
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Input</label>
                                            <textarea
                                                {...register('hidden2Input', {
                                                    required: 'Hidden 2 Input is required',
                                                })}
                                                className={`${inputClass} font-mono text-sm h-24`}
                                            />
                                            {errors.hidden2Input && (
                                                <p className={errorClass}>
                                                    {errors.hidden2Input.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Output</label>
                                            <textarea
                                                {...register('hidden2Output', {
                                                    required: 'Hidden 2 Output is required',
                                                })}
                                                className={`${inputClass} font-mono text-sm h-24`}
                                            />
                                            {errors.hidden2Output && (
                                                <p className={errorClass}>
                                                    {errors.hidden2Output.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-100 p-6 rounded-lg space-y-4">
                                    <h3 className="font-medium text-gray-800">
                                        Hidden Test Case 3
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>Input</label>
                                            <textarea
                                                {...register('hidden3Input', {
                                                    required: 'Hidden 3 Input is required',
                                                })}
                                                className={`${inputClass} font-mono text-sm h-24`}
                                            />
                                            {errors.hidden3Input && (
                                                <p className={errorClass}>
                                                    {errors.hidden3Input.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className={labelClass}>Output</label>
                                            <textarea
                                                {...register('hidden3Output', {
                                                    required: 'Hidden 3 Output is required',
                                                })}
                                                className={`${inputClass} font-mono text-sm h-24`}
                                            />
                                            {errors.hidden3Output && (
                                                <p className={errorClass}>
                                                    {errors.hidden3Output.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Submit Button */}
                            <div className="pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-4 px-4 rounded-md shadow-md text-white font-bold text-lg transition-all
                    ${isSubmitting
                                            ? 'bg-blue-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center">
                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                ></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            Uploading...
                                        </span>
                                    ) : (
                                        'Upload Question'
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
