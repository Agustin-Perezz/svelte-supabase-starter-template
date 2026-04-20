<script lang="ts">
  import { Button } from '$components/ui/button';
</script>

<div class="space-y-2">
  <form method="POST" action="?/google">
    <Button
      type="submit"
      variant="outline"
      class="w-full"
      data-testid="google-oauth-button"
    >
      <img src="/svg/google.svg" alt="Google" class="mr-2 h-5 w-5" />
      Continuar con Google
    </Button>
  </form>

  <form method="POST" action="?/facebook">
    <Button
      type="submit"
      variant="outline"
      class="w-full"
      data-testid="facebook-oauth-button"
    >
      <img src="/svg/facebook.svg" alt="Facebook" class="mr-2 h-5 w-5" />
      Continuar con Facebook
    </Button>
  </form>
</div>
