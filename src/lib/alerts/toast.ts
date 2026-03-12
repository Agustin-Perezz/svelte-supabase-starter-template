import toast from 'svelte-french-toast';

export const successToast = (message: string) => {
  toast.success(message, {
    duration: 3000,
    position: 'bottom-right'
  });
};

export const errorToast = (message: string) => {
  toast.error(message, {
    duration: 3000,
    position: 'bottom-right'
  });
};
