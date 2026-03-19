"use client";

import { useEffect, useCallback } from "react";
import "driver.js/dist/driver.css";
import { useTour } from "@/components/providers/tour-provider";
import { useMediaQuery } from "@/lib/hooks";
import type { DriveStep } from "driver.js";

interface GuidedTourProps {
  hasSeenTour: boolean;
}

/**
 * Retorna os steps do tour adaptados para mobile ou desktop
 */
const getSteps = (isMobile: boolean): DriveStep[] => {
  return [
    {
      popover: {
        title: "👋 Bem-vindo ao ClearBalance!",
        description:
          "Vamos fazer um <strong>tour guiado</strong> pelo site para você conhecer todas as funcionalidades e começar a organizar suas finanças. Será rápido!",
        align: "center",
      },
    },
    // Step 2: Navegação - adaptado para mobile/desktop
    {
      element: isMobile ? "[data-tour='sidebar-nav-mobile']" : "[data-tour='sidebar-nav']",
      popover: {
        title: "🧭 Navegação",
        description: isMobile
          ? "Use o <strong>menu inferior</strong> para navegar entre <strong>Dashboard</strong>, <strong>Categorias</strong>, <strong>Metas</strong> e <strong>Configurações</strong>."
          : "Use o menu lateral para navegar entre <strong>Dashboard</strong>, <strong>Categorias</strong>, <strong>Metas</strong> e <strong>Configurações</strong>.",
        side: isMobile ? "top" : "right",
        align: "center",
      },
    },
    {
      element: "[data-tour='new-transaction']",
      popover: {
        title: "➕ Nova Transação",
        description:
          "Clique aqui para registrar uma nova <strong>receita</strong> ou <strong>despesa</strong> rapidamente.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: "[data-tour='month-selector']",
      popover: {
        title: "📅 Seletor de Mês",
        description:
          "Navegue entre os meses para visualizar o histórico financeiro de qualquer período.",
        side: "bottom",
        align: "start",
      },
    },
    {
      element: "[data-tour='summary-cards']",
      popover: {
        title: "💰 Resumo do Mês",
        description:
          "Aqui você vê suas <strong>Entradas</strong>, <strong>Saídas</strong>, <strong>Saldo</strong> e o <strong>Montante acumulado</strong> para o mês selecionado.",
        side: "bottom",
        align: "center",
      },
    },
    {
      element: "[data-tour='variation-charts']",
      popover: {
        title: "📈 Variação Mensal",
        description:
          "Acompanhe a evolução das suas <strong>entradas</strong> e <strong>saídas</strong> nos últimos 6 meses.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "[data-tour='charts']",
      popover: {
        title: "📊 Categorias",
        description:
          "Veja as categorias com maior peso e alterne entre <strong>Saídas</strong> e <strong>Entradas</strong> para comparar rapidamente.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "[data-tour='goals-chart']",
      popover: {
        title: "🎯 Metas",
        description:
          "Acompanhe o progresso das suas <strong>metas financeiras</strong>. Crie metas na página de Metas.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "[data-tour='budget-chart']",
      popover: {
        title: "🧾 Orçamento",
        description:
          "Monitore quanto já foi gasto em cada categoria em relação ao limite mensal definido.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "[data-tour='calendar']",
      popover: {
        title: "📆 Calendário",
        description:
          "Visualize suas transações em um <strong>calendário mensal</strong>. Os dias com movimentações aparecem destacados.",
        side: "top",
        align: "center",
      },
    },
    {
      element: "[data-tour='transactions-table']",
      popover: {
        title: "📋 Transações",
        description:
          "Veja, filtre, edite e exclua todas as suas transações. Use os filtros para encontrar lançamentos específicos.",
        side: "top",
        align: "center",
      },
    },
    // Step 11: Ajuda - adaptado para mobile/desktop
    {
      element: isMobile ? "[data-tour='help-button-mobile']" : "[data-tour='help-button']",
      popover: {
        title: "❓ Precisa de Ajuda?",
        description: isMobile
          ? "Toque no ícone de <strong>Ajuda</strong> na barra inferior sempre que quiser <strong>rever este tour</strong>."
          : "Clique neste ícone sempre que quiser <strong>rever este tour</strong> ou relembrar como o ClearBalance funciona.",
        side: isMobile ? "top" : "right",
        align: "center",
      },
    },
  ];
};

export const GuidedTour = ({ hasSeenTour }: GuidedTourProps) => {
  const { registerStartTour } = useTour();
  const isMobile = useMediaQuery();

  const markAsSeen = useCallback(async () => {
    try {
      await fetch("/api/settings/tour", { method: "PATCH" });
    } catch {
      // silently ignore — worst case the tour re-shows once more on next login
    }
  }, []);

  const startTour = useCallback(async () => {
    const { driver } = await import("driver.js");

    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayOpacity: 0.5,
      stagePadding: 8,
      stageRadius: 8,
      smoothScroll: true,
      nextBtnText: "Próximo →",
      prevBtnText: "← Anterior",
      doneBtnText: "Concluir ✓",
      progressText: "{{current}} de {{total}}",
      popoverClass: "clearbalance-tour-popover",
      onDestroyed: () => {
        markAsSeen();
      },
      steps: getSteps(isMobile),
    });

    driverObj.drive();
  }, [markAsSeen, isMobile]);

  // Register with context so HelpButton can trigger it
  useEffect(() => {
    registerStartTour(startTour);
  }, [registerStartTour, startTour]);

  // Check if tour should start after redirect or for first-time users
  useEffect(() => {
    const shouldStartTour = sessionStorage.getItem("clearbalance-start-tour");
    if (shouldStartTour === "true") {
      sessionStorage.removeItem("clearbalance-start-tour");
      startTour();
    } else if (!hasSeenTour) {
      startTour();
    }
  }, [hasSeenTour, startTour]);

  return null;
};
