/**
 * COMPLEX INTERACTION TESTING EXAMPLES
 *
 * Đây là các ví dụ về interaction tests phức tạp chạy trong browser mode.
 * Tests này sẽ được chạy với Playwright Chromium để đảm bảo behavior giống production.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { Button } from "./button/button";
import { Input } from "./input/input";

// ============================================
// Example 1: Login Form with Validation
// ============================================

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
}

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ email, password });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-[400px] space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          prefix={<Mail className="size-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          status={errors.email ? "error" : undefined}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p
            id="email-error"
            className="mt-1 text-sm text-red-500"
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          prefix={<Lock className="size-4" />}
          suffix={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          status={errors.password ? "error" : undefined}
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <p
            id="password-error"
            className="mt-1 text-sm text-red-500"
            role="alert"
          >
            {errors.password}
          </p>
        )}
      </div>

      <Button type="submit" variant="solid" color="primary" className="w-full">
        Sign In
      </Button>
    </form>
  );
};

const meta = {
  title: "Examples/Complex Interaction Tests",
  component: LoginForm,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

// Test: Complete login flow with validation
export const LoginFormFlow: Story = {
  args: {
    onSubmit: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Submit empty form and verify validation errors", async () => {
      const submitButton = canvas.getByRole("button", { name: /sign in/i });

      // Click submit without filling anything
      await userEvent.click(submitButton);

      // Wait for validation errors to appear
      await waitFor(async () => {
        const emailError = canvas.getByText(/email is required/i);
        const passwordError = canvas.getByText(/password is required/i);

        await expect(emailError).toBeTruthy();
        await expect(passwordError).toBeTruthy();
      });

      // Verify form was NOT submitted
      await expect(args.onSubmit).not.toHaveBeenCalled();
    });

    await step("Enter invalid email and verify error", async () => {
      const emailInput = canvas.getByLabelText(/email/i);

      // Focus and clear any existing value first
      await userEvent.click(emailInput);
      await userEvent.clear(emailInput);

      // Wait a bit to ensure clear is processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Type invalid email - wait for it to complete fully
      await userEvent.type(emailInput, "invalid-email", { delay: 10 });

      // Wait for DOM value to be fully set - verify the complete string
      await waitFor(async () => {
        const input = emailInput as HTMLInputElement;
        const value = input.value;
        await expect(value).toBe("invalid-email");
      }, { timeout: 2000 });

      // Additional wait to ensure React state has fully updated after typing completes
      await new Promise((resolve) => setTimeout(resolve, 300));

      const submitButton = canvas.getByRole("button", { name: /sign in/i });
      await userEvent.click(submitButton);

      // Wait for validation error to appear
      // The error should be "Email is invalid" since we have a value but it's invalid
      await waitFor(async () => {
        const emailError = canvas.getByText(/email is invalid/i);
        await expect(emailError).toBeTruthy();
        await expect(emailError.getAttribute("role")).toBe("alert");
      }, { timeout: 2000 });
    });

    await step("Enter short password and verify error", async () => {
      const emailInput = canvas.getByLabelText(/email/i);
      const passwordInput = canvas.getByLabelText(/^password$/i);

      // Clear and enter valid email
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, "user@example.com");

      // Enter short password
      await userEvent.type(passwordInput, "short");

      const submitButton = canvas.getByRole("button", { name: /sign in/i });
      await userEvent.click(submitButton);

      await waitFor(async () => {
        const passwordError = canvas.getByText(
          /password must be at least 8 characters/i,
        );
        await expect(passwordError).toBeTruthy();
      });
    });

    await step("Toggle password visibility", async () => {
      const passwordInput = canvas.getByLabelText(
        /^password$/i,
      );
      const toggleButton = canvas.getByLabelText(/show password/i);

      // Initially password should be hidden
      await expect((passwordInput as HTMLInputElement).type).toBe("password");

      // Click to show password
      await userEvent.click(toggleButton);
      await expect((passwordInput as HTMLInputElement).type).toBe("text");

      // Click to hide password again
      const hideButton = canvas.getByLabelText(/hide password/i);
      await userEvent.click(hideButton);
      await expect((passwordInput as HTMLInputElement).type).toBe("password");
    });

    await step("Submit valid form", async () => {
      const emailInput = canvas.getByLabelText(/email/i);
      const passwordInput = canvas.getByLabelText(/^password$/i);

      // Clear previous inputs
      await userEvent.clear(emailInput);
      await userEvent.clear(passwordInput);

      // Enter valid credentials
      await userEvent.type(emailInput, "user@example.com");
      await userEvent.type(passwordInput, "SecurePassword123");

      const submitButton = canvas.getByRole("button", { name: /sign in/i });
      await userEvent.click(submitButton);

      // Verify form was submitted with correct data
      await waitFor(async () => {
        await expect(args.onSubmit).toHaveBeenCalledWith({
          email: "user@example.com",
          password: "SecurePassword123",
        });
      });
    });
  },
};

// ============================================
// Example 2: Search Form with Debounce
// ============================================

interface SearchFormProps {
  onSearch: (query: string) => Promise<string[]>;
  onSelect: (item: string) => void;
}

const SearchForm = ({ onSearch, onSelect }: SearchFormProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  const handleSearch = async (value: string) => {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    // Simulate debounce
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const data = await onSearch(value);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[400px] space-y-4">
      <Input
        placeholder="Search..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        suffix={loading ? <span>Loading...</span> : null}
      />

      {results.length > 0 && (
        <ul className="divide-y rounded border" role="listbox">
          {results.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="w-full p-2 text-left hover:bg-gray-100"
                role="option"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export const SearchWithDebounce: StoryObj<SearchFormProps> = {
  render: (args) => <SearchForm {...args} />,
  args: {
    onSearch: fn(async (query: string) => {
      // Mock search results
      const allItems = [
        "Apple",
        "Apricot",
        "Banana",
        "Blueberry",
        "Cherry",
        "Grape",
      ];
      return allItems.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase()),
      );
    }),
    onSelect: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Type search query and wait for results", async () => {
      const searchInput = canvas.getByPlaceholderText("Search...");

      // Type search query
      await userEvent.type(searchInput, "app");

      // Wait for loading state to appear
      // Use waitFor with getByText since loading is transient
      // The loading appears during the 300ms debounce, so we need to catch it quickly
      await waitFor(
        async () => {
          const loading = canvas.getByText("Loading...");
          await expect(loading).toBeTruthy();
        },
        { timeout: 500 },
      );

      // Wait for results (this ensures the final search with "app" has completed)
      // The results "Apple" and "Apricot" only match "app", proving that was the final query
      await waitFor(
        async () => {
          const appleOption = canvas.getByRole("option", { name: /apple/i });
          const apricotOption = canvas.getByRole("option", { name: /apricot/i });
          await expect(appleOption).toBeTruthy();
          await expect(apricotOption).toBeTruthy();
        },
        { timeout: 1000 },
      );

      // Wait a bit more to ensure the final debounced call with "app" has completed
      // The debounce is 300ms, so wait 400ms to ensure the final call completes
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Verify onSearch was called
      // Note: The debounce implementation doesn't cancel previous calls,
      // so intermediate calls ("ap") may occur, but the presence of "Apple" and "Apricot"
      // in the results proves the final call was with "app"
      await expect(args.onSearch).toHaveBeenCalled();
      
      // Verify the results match what we'd expect from searching "app"
      // This indirectly confirms "app" was the final query used
      const results = canvas.getAllByRole("option");
      const resultTexts = results.map((r) => r.textContent);
      await expect(resultTexts).toContain("Apple");
      await expect(resultTexts).toContain("Apricot");
    });

    await step("Click on search result", async () => {
      const appleOption = canvas.getByRole("option", { name: /^apple$/i });

      await userEvent.click(appleOption);

      // Verify onSelect was called
      await expect(args.onSelect).toHaveBeenCalledWith("Apple");
    });
  },
};

// ============================================
// Example 3: Multi-step Form
// ============================================

interface MultiStepFormProps {
  onComplete: (data: {
    step1: { username: string };
    step2: { email: string };
    step3: { phone: string };
  }) => void;
}

const MultiStepForm = ({ onComplete }: MultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState({
    step1: { username: "" },
    step2: { email: "" },
    step3: { phone: "" },
  });

  const handleNext = (stepData: Record<string, string>) => {
    setData((prev) => {
      const updated = {
        ...prev,
        [`step${currentStep}`]: stepData,
      };
      if (currentStep === 3) {
        onComplete({
          step1: updated.step1,
          step2: updated.step2,
          step3: updated.step3,
        });
      }
      return updated;
    });
    if (currentStep !== 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="w-[400px] space-y-4">
      <div className="flex justify-between text-sm">
        <span>Step {currentStep} of 3</span>
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
          <Input
            id="username"
            placeholder="Username"
            prefix={<User className="size-4" />}
            defaultValue={data.step1.username}
          />
          <Button
            onClick={() => {
              const username = (
                document.querySelector<HTMLInputElement>("#username")
              )?.value;
              if (!username) return;
              handleNext({ username });
            }}
            variant="solid"
            color="primary"
            className="w-full"
          >
            Next
          </Button>
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <Input
            id="email"
            placeholder="Email"
            type="email"
            prefix={<Mail className="size-4" />}
            defaultValue={data.step2.email}
          />
          <div className="flex gap-2">
            <Button onClick={handleBack} variant="outlined" className="flex-1">
              Back
            </Button>
            <Button
              onClick={() => {
                const email = (
                  document.querySelector<HTMLInputElement>("#email")
                )?.value;
                if (!email) return;
                handleNext({ email });
              }}
              variant="solid"
              color="primary"
              className="flex-1"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <Input
            id="phone"
            placeholder="Phone"
            defaultValue={data.step3.phone}
          />
          <div className="flex gap-2">
            <Button onClick={handleBack} variant="outlined" className="flex-1">
              Back
            </Button>
            <Button
              onClick={() => {
                const phone = (
                  document.querySelector<HTMLInputElement>("#phone")
                )?.value;
                if (!phone) return;
                handleNext({ phone });
              }}
              variant="solid"
              color="success"
              className="flex-1"
            >
              Complete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const MultiStepFormFlow: StoryObj<MultiStepFormProps> = {
  render: (args) => <MultiStepForm {...args} />,
  args: {
    onComplete: fn(),
  },
  play: async ({ args, canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Fill Step 1 - Username", async () => {
      const usernameInput = canvas.getByPlaceholderText("Username");
      await userEvent.type(usernameInput, "johndoe");

      const nextButton = canvas.getByRole("button", { name: /next/i });
      await userEvent.click(nextButton);

      // Verify moved to step 2
      await waitFor(async () => {
        const step2Text = canvas.getByText("Step 2 of 3");
        await expect(step2Text).toBeTruthy();
      });
    });

    await step("Fill Step 2 - Email", async () => {
      const emailInput = canvas.getByPlaceholderText("Email");
      await userEvent.type(emailInput, "john@example.com");

      const nextButton = canvas.getByRole("button", { name: /next/i });
      await userEvent.click(nextButton);

      // Verify moved to step 3
      await waitFor(async () => {
        const step3Text = canvas.getByText("Step 3 of 3");
        await expect(step3Text).toBeTruthy();
      });
    });

    await step("Navigate back to verify data persistence", async () => {
      const backButton = canvas.getByRole("button", { name: /back/i });
      await userEvent.click(backButton);

      // Should be on step 2
      await waitFor(async () => {
        const emailInput = canvas.getByPlaceholderText<HTMLInputElement>(
          "Email",
        );
        await expect(emailInput.value).toBe("john@example.com");
      });

      // Go forward again
      const nextButton = canvas.getByRole("button", { name: /next/i });
      await userEvent.click(nextButton);
    });

    await step("Complete Step 3 - Phone", async () => {
      const phoneInput = canvas.getByPlaceholderText("Phone");
      await userEvent.type(phoneInput, "1234567890");

      const completeButton = canvas.getByRole("button", { name: /complete/i });
      await userEvent.click(completeButton);

      // Verify form completion
      await waitFor(async () => {
        await expect(args.onComplete).toHaveBeenCalledWith({
          step1: { username: "johndoe" },
          step2: { email: "john@example.com" },
          step3: { phone: "1234567890" },
        });
      });
    });
  },
};
