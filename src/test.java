public class test {
    public static class InstantHM {

        private int heure;
        private int minute;

        // Constructeur
        public InstantHM(int heure, int minute) {
            this.heure = heure;
            this.minute = minute;
        }

        // Méthode d'ajout d'un instant
        public void ajoute(InstantHM autre) {

            this.heure += autre.heure;
            this.minute += autre.minute;

            // conversion des minutes en heures
            this.heure += this.minute / 60;
            this.minute = this.minute % 60;

            // gestion du passage après 24h
            this.heure = this.heure % 24;
        }

        // Méthode d'affichage
        @Override
        public String toString() {
            return heure + "h " + minute + "m";
        }

        public static void main(String[] args) {

            InstantHM instant = new InstantHM(9, 50);

            System.out.println(instant);
            // Affichage attendu : 9h 50m

            instant.ajoute(new InstantHM(17, 13));

            System.out.println(instant);
            // Affichage attendu : 3h 3m
        }
    }


    public static class InstantHMS extends InstantHM {
        private int seconde;

        public InstantHMS(int heure, int minute, int seconde) {
            super(heure, minute);
            this.seconde = seconde;
        }

        @Override
        public String toString() {
            return super.toString() + " " + seconde + "s";
        }

        public void ajoute(InstantHMS autre) {
            this.seconde += autre.seconde;
            this.ajoute(new InstantHM(0, this.seconde / 60)) ;
            this.seconde = this.seconde % 60;
            super.ajoute(autre);
        }
    }
}