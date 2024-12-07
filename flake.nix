{
  description = "test-webauthn";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    system = "x86_64-linux";

    unstable-pkgs = import nixpkgs {inherit system;};

    prod-pkgs = [];

    dev-pkgs =
      prod-pkgs
      ++ [
        # shell
        unstable-pkgs.fish
        unstable-pkgs.starship

        unstable-pkgs.certbot
        unstable-pkgs.jq
        unstable-pkgs.nodejs_23

        # unstable-pkgs.mkcert
        # unstable-pkgs.nss
      ];
  in {
    devShells.${system}.default = unstable-pkgs.mkShell {
      buildInputs = dev-pkgs;
      shellHook = ''
        exec fish
      '';
    };
  };
}
